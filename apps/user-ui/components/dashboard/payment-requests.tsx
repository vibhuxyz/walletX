"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency, getInitials, formatDate } from "@/lib/constants";
import {
  DollarSign,
  Check,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getReceivedRequests,
  payRequest,
  declineRequest,
  type PaymentRequest,
} from "@/lib/api/requestApi";
import { qk } from "@/lib/wallet/useWalletQuery";

export function PaymentRequests() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [pin, setPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);

  // Fetch received requests
  const { data, isLoading } = useQuery({
    queryKey: qk.paymentRequestsReceived,
    queryFn: () => getReceivedRequests(),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Pay request mutation
  const payMutation = useMutation({
    mutationFn: ({ requestId, pin }: { requestId: string; pin: string }) =>
      payRequest(requestId, pin),
    onSuccess: (response, variables) => {
      const request = paymentRequests.find(
        (r) => r.requestId === variables.requestId,
      );
      toast.success(
        `${formatCurrency(parseFloat(response.amount))} paid to ${response.requester.name}`,
      );
      setShowPinModal(false);
      setPin("");
      setSelectedRequestId(null);
      queryClient.invalidateQueries({
        queryKey: qk.paymentRequestsReceived,
      });
      queryClient.invalidateQueries({ queryKey: qk.balance });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerStats });
      queryClient.invalidateQueries({ queryKey: qk.walletTransactionsRoot });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Payment failed");
    },
  });

  // Decline request mutation
  const declineMutation = useMutation({
    mutationFn: declineRequest,
    onSuccess: () => {
      toast.info("Payment request declined");
      queryClient.invalidateQueries({
        queryKey: qk.paymentRequestsReceived,
      });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.ledgerRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerStats });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to decline request");
    },
  });

  const paymentRequests = data?.requests || [];
  const pendingRequests = paymentRequests.filter((r) => r.status === "PENDING");
  const resolvedRequests = paymentRequests.filter(
    (r) => r.status !== "PENDING",
  );

  function handlePayClick(requestId: string) {
    setSelectedRequestId(requestId);
    setShowPinModal(true);
  }

  function handlePayConfirm() {
    if (!selectedRequestId) return;

    if (!pin || pin.length !== 4) {
      toast.error("Please enter your 4-digit PIN");
      return;
    }

    payMutation.mutate({ requestId: selectedRequestId, pin });
  }

  function handleDecline(requestId: string) {
    declineMutation.mutate(requestId);
  }

  if (isLoading) {
    return (
      <Card className="border-border/30 bg-card">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0 && resolvedRequests.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-border/30 bg-card">
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-left"
          >
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-primary" />
              Payment Requests
              {pendingRequests.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs ml-1">
                  {pendingRequests.length} pending
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs">{expanded ? "Hide" : "View"}</span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>
        </CardHeader>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {pendingRequests.map((request, i) => (
                      <motion.div
                        key={request.requestId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 rounded-xl border border-border/30 bg-secondary/20 p-3"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {request.requester
                              ? getInitials(request.requester.name)
                              : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {request.requester?.name || "Unknown"}
                            </p>
                            <Badge
                              variant="secondary"
                              className="bg-warning/10 text-warning-foreground text-[9px] shrink-0"
                            >
                              Pending
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mt-0.5">
                            {formatCurrency(parseFloat(request.amount))}
                          </p>
                          {request.reason && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground truncate">
                                {request.reason}
                              </p>
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDate(new Date(request.createdAt))}
                          </p>
                          <div className="flex gap-2 mt-2.5">
                            <Button
                              size="sm"
                              onClick={() => handlePayClick(request.requestId)}
                              disabled={payMutation.isPending}
                              className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                            >
                              {payMutation.isPending &&
                              selectedRequestId === request.requestId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Pay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecline(request.requestId)}
                              disabled={
                                declineMutation.isPending &&
                                declineMutation.variables === request.requestId
                              }
                              className="h-8 gap-1.5 border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/30 text-xs"
                            >
                              {declineMutation.isPending &&
                              declineMutation.variables ===
                                request.requestId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              Decline
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {resolvedRequests.length > 0 && (
                    <div className="mt-2 border-t border-border/20 pt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Recent
                      </p>
                      {resolvedRequests.slice(0, 3).map((request) => (
                        <div
                          key={request.requestId}
                          className="flex items-center gap-3 rounded-lg px-2 py-2"
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                              {request.requester
                                ? getInitials(request.requester.name)
                                : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">
                              {request.requester?.name || "Unknown"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-muted-foreground">
                              {formatCurrency(parseFloat(request.amount))}
                            </p>
                            <Badge
                              variant="secondary"
                              className={`text-[8px] ${
                                request.status === "APPROVED"
                                  ? "bg-success/10 text-success"
                                  : request.status === "REJECTED"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {request.status === "APPROVED"
                                ? "paid"
                                : request.status === "REJECTED"
                                  ? "declined"
                                  : request.status.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingRequests.length === 0 &&
                    resolvedRequests.length > 0 && (
                      <p className="text-center text-xs text-muted-foreground py-2">
                        No pending requests
                      </p>
                    )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* PIN Confirmation Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">Enter your PIN to confirm</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                maxLength={4}
                className="h-12 text-center text-lg font-bold tracking-widest"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowPinModal(false);
                setPin("");
                setSelectedRequestId(null);
              }}
              disabled={payMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayConfirm}
              disabled={payMutation.isPending || pin.length !== 4}
              className="gap-2"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
