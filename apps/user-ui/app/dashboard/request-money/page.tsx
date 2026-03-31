"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Calendar,
  MessageSquare,
  User,
  Loader2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/constants";
import { KycGate } from "@/components/shared/kyc-gate";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createPaymentRequest,
  getSentRequests,
  getReceivedRequests,
  payRequest,
  declineRequest,
  cancelRequest,
  type PaymentRequest,
} from "@/lib/api/requestApi";
import { qk, useRecentRecipients } from "@/lib/wallet/useWalletQuery";
import { getLedgerStatistics } from "@/lib/api/ledgerApi";

//  Component

function RequestMoneyContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [recipientIdentifier, setRecipientIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);

  // Fetch recent recipients for quick contacts
  const { data: recentRecipients = [] } = useRecentRecipients();

  // Fetch sent requests
  const { data: sentData, isLoading: loadingSent } = useQuery({
    queryKey: qk.paymentRequestsSent,
    queryFn: () => getSentRequests(),
    staleTime: 1000 * 30,
  });

  // Fetch received requests
  const { data: receivedData, isLoading: loadingReceived } = useQuery({
    queryKey: qk.paymentRequestsReceived,
    queryFn: () => getReceivedRequests(),
    staleTime: 1000 * 30,
  });

  // Fetch ledger statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: qk.ledgerStats,
    queryFn: () => getLedgerStatistics(),
    staleTime: 1000 * 60,
  });

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: createPaymentRequest,
    onSuccess: (data) => {
      toast.success(`Request sent to ${data.recipient.name}!`);
      setRecipientIdentifier("");
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: qk.paymentRequestsSent });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to create payment request",
      );
    },
  });

  // Pay request mutation
  const payMutation = useMutation({
    mutationFn: ({ requestId, pin }: { requestId: string; pin: string }) =>
      payRequest(requestId, pin),
    onSuccess: (data) => {
      toast.success(`Payment of ${data.amount} successful!`);
      setSelectedRequest(null);
      setPin("");
      setShowPinInput(false);
      queryClient.invalidateQueries({
        queryKey: qk.paymentRequestsReceived,
      });
      queryClient.invalidateQueries({ queryKey: qk.balance });
      queryClient.invalidateQueries({ queryKey: qk.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: qk.walletTransactionsRoot });
      queryClient.invalidateQueries({ queryKey: qk.ledgerStats });
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
      setSelectedRequest(null);
      queryClient.invalidateQueries({
        queryKey: qk.paymentRequestsReceived,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to decline request");
    },
  });

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => {
      toast.success("Request cancelled");
      queryClient.invalidateQueries({ queryKey: qk.paymentRequestsSent });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to cancel request");
    },
  });

  const sentRequests = sentData?.requests || [];
  const receivedRequests = receivedData?.requests || [];

  // Calculate detailed summary
  const summary = useMemo(() => {
    // From sent requests money you requested from others
    const sentApproved = sentRequests
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const sentPending = sentRequests.filter(
      (r) => r.status === "PENDING",
    ).length;

    const sentDeclined = sentRequests.filter(
      (r) => r.status === "REJECTED" || r.status === "EXPIRED",
    ).length;

    // From received requests money others requested from you
    const receivedPaid = receivedRequests
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const receivedPending = receivedRequests.filter(
      (r) => r.status === "PENDING",
    ).length;

    const receivedDeclined = receivedRequests.filter(
      (r) => r.status === "REJECTED" || r.status === "EXPIRED",
    ).length;

    // From ledger stats all-time
    const totalFromLedger = statsData
      ? parseFloat(statsData.requests.totalAmount)
      : 0;
    const countFromLedger = statsData ? statsData.requests.count : 0;

    return {
      // Sent money I received from my requests
      sentApproved,
      sentPending,
      sentDeclined,

      // Received money I paid to others' requests
      receivedPaid,
      receivedPending,
      receivedDeclined,

      // All-time totals
      totalFromLedger,
      countFromLedger,
    };
  }, [sentRequests, receivedRequests, statsData]);

  function handleCreateRequest() {
    if (!recipientIdentifier.trim()) {
      toast.error("Please enter recipient email, phone, or wallet ID");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createMutation.mutate({
      recipientIdentifier: recipientIdentifier.trim(),
      amount,
      reason: note.trim() || undefined,
    });
  }

  function handleQuickSelect(email: string) {
    setRecipientIdentifier(email);
    setSearchQuery("");
  }

  function handleProcessPayment() {
    if (!selectedRequest) return;

    if (!showPinInput) {
      setShowPinInput(true);
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Please enter your 4-digit PIN");
      return;
    }

    payMutation.mutate({ requestId: selectedRequest.requestId, pin });
  }

  function handleDeclinePayment() {
    if (!selectedRequest) return;
    declineMutation.mutate(selectedRequest.requestId);
  }

  function handleCancelRequest(requestId: string) {
    cancelMutation.mutate(requestId);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function formatAmount(amount: string) {
    return `₹${parseFloat(amount).toFixed(2)}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-[1440px] mx-auto pt-4">
        {/*  Request Form Col Span 5 */}
        <div className="lg:col-span-5">
          <Card className="border-gray-200 shadow-sm rounded-[24px] overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-[24px] font-extrabold text-[#373d48] mb-6">
                Send a New Payment Request
              </h2>

              {/* To Field */}
              <div className="flex flex-col gap-3 mb-6">
                <Label className="text-sm font-bold text-[#373d48]">To:</Label>
                <Input
                  placeholder="Enter email, phone, or wallet ID"
                  value={recipientIdentifier}
                  onChange={(e) => setRecipientIdentifier(e.target.value)}
                  className="h-14 bg-white border-gray-300 rounded-xl text-base placeholder:text-gray-400 focus-visible:ring-[#25d366]"
                />
              </div>

              {/* Amount Field */}
              <div className="flex flex-col gap-2 mb-6">
                <Label className="text-sm font-bold text-[#373d48]">
                  Amount
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-5 text-[22px] font-bold text-[#373d48]">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-[22px] font-bold h-16 bg-gray-50/50 border-gray-200 rounded-xl"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Purpose Note */}
              <div className="flex flex-col gap-2 mb-8">
                <Label className="text-sm font-bold text-[#373d48]">
                  Purpose (Optional)
                </Label>
                <Textarea
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="bg-gray-50/50 border-gray-200 rounded-xl resize-none focus-visible:ring-[#25d366]"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleCreateRequest}
                disabled={createMutation.isPending}
                className="w-full bg-[#1b3b28] hover:bg-[#142c1e] text-white rounded-xl py-4 flex flex-col items-center justify-center transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold text-base">Send Request</span>
                    <span className="text-xs text-white/70">
                      Request money from recipient
                    </span>
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Contacts, Received Requests, Sent & Summary */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Contacts */}
          <Card className="border-gray-200 shadow-sm rounded-[24px]">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-base font-bold text-[#373d48]">
                Quick Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recentRecipients.slice(0, 8).map((recipient) => (
                  <div
                    key={recipient.id}
                    onClick={() => handleQuickSelect(recipient.email)}
                    className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group"
                  >
                    <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-[#25d366] transition-all">
                      <AvatarFallback className="bg-[#e2f3e8] text-[#1b4b36] font-bold text-sm">
                        {getInitials(recipient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-[#373d48] text-center truncate w-full">
                      {recipient.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/*  Received Requests (Incoming) */}
          <Card className="border-gray-200 shadow-sm rounded-[24px]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-[#373d48]">
                Received Requests (Incoming)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 flex flex-col gap-3">
              {loadingReceived ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : receivedRequests.length === 0 ? (
                <p className="text-center py-8 text-gray-400">
                  No received requests
                </p>
              ) : (
                receivedRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-white border border-gray-100 text-[#373d48] font-bold text-sm">
                          {req.requester
                            ? getInitials(req.requester.name)
                            : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[14px] font-bold text-[#373d48] leading-tight mb-0.5">
                          {req.requester?.name || "Unknown"}
                        </p>
                        <p className="text-[12px] font-semibold text-[#5d7079]">
                          Req:{" "}
                          <span className="text-[#373d48]">
                            {formatAmount(req.amount)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                      {req.status === "PENDING" && (
                        <Button
                          onClick={() => setSelectedRequest(req)}
                          variant="outline"
                          className="border-gray-200 text-[#373d48] h-9 px-6 text-xs font-bold hover:bg-gray-100 bg-white"
                        >
                          Review
                        </Button>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="text-[13px] font-bold text-[#20bd5b] flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Paid
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="text-[13px] font-bold text-red-600">
                          Declined
                        </span>
                      )}
                      {req.status === "EXPIRED" && (
                        <span className="text-[13px] font-bold text-gray-400">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/*  Sent Requests & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sent Requests (Outgoing)  */}
            <Card className="border-gray-200 shadow-sm rounded-[24px] md:col-span-3">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-base font-bold text-[#373d48]">
                  Sent Requests (Outgoing)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex flex-col gap-5">
                {loadingSent ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : sentRequests.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">
                    No sent requests
                  </p>
                ) : (
                  sentRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gray-100 text-[#373d48] font-bold text-xs">
                            {req.requestedFrom
                              ? getInitials(req.requestedFrom.name)
                              : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-[#373d48] leading-tight">
                            {req.requestedFrom?.name || "Unknown"}
                          </p>
                          <p className="text-[11px] text-[#5d7079]">
                            Recipient
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <span className="text-sm font-bold text-[#373d48]">
                          {formatAmount(req.amount)}
                        </span>
                        {req.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelRequest(req.requestId)}
                            disabled={cancelMutation.isPending}
                            className="flex items-center text-xs font-bold text-[#373d48] hover:text-gray-600 transition-colors disabled:opacity-50"
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="text-xs font-bold text-red-700">
                            Canceled
                          </span>
                        )}
                        {req.status === "APPROVED" && (
                          <span className="text-xs font-bold text-[#20bd5b]">
                            Completed
                          </span>
                        )}
                        {req.status === "EXPIRED" && (
                          <span className="text-xs font-bold text-gray-400">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/*  ENHANCED Payment Summary */}
            <Card className="border-gray-200 shadow-sm rounded-[24px] md:col-span-2 flex flex-col">
              <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-base font-bold text-[#373d48] leading-tight">
                  Requests Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4 flex flex-col flex-1">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {/* Received Money I got from my requests */}
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e2f3e8] text-[#25d366]">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-[10px] font-bold text-[#5d7079] uppercase tracking-wider">
                              Received
                            </p>
                            <p className="text-[9px] text-[#5d7079]">
                              From my requests
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-extrabold text-[#25d366]">
                          ₹{summary.sentApproved.toFixed(2)}
                        </p>
                      </div>

                      {/* Status breakdown */}
                      <div className="flex items-center gap-3 pl-9 text-[10px]">
                        {summary.sentPending > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-600" />
                            <span className="font-semibold text-[#5d7079]">
                              {summary.sentPending} pending
                            </span>
                          </div>
                        )}
                        {summary.sentDeclined > 0 && (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="font-semibold text-[#5d7079]">
                              {summary.sentDeclined} declined
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Paid Out Money I paid to others' requests */}
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
                            <TrendingDown className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-[10px] font-bold text-[#5d7079] uppercase tracking-wider">
                              Paid Out
                            </p>
                            <p className="text-[9px] text-[#5d7079]">
                              To others' requests
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-extrabold text-[#373d48]">
                          ₹{summary.receivedPaid.toFixed(2)}
                        </p>
                      </div>

                      {/* Status breakdown */}
                      <div className="flex items-center gap-3 pl-9 text-[10px]">
                        {summary.receivedPending > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-600" />
                            <span className="font-semibold text-[#5d7079]">
                              {summary.receivedPending} pending
                            </span>
                          </div>
                        )}
                        {summary.receivedDeclined > 0 && (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="font-semibold text-[#5d7079]">
                              {summary.receivedDeclined} declined
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* All Time Total */}
                    <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-gray-50/50">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-[#5d7079] uppercase tracking-wider">
                          All-Time Total
                        </p>
                        <p className="text-[9px] text-[#5d7079]">
                          {summary.countFromLedger} transaction
                          {summary.countFromLedger !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-base font-extrabold text-[#373d48]">
                        ₹{summary.totalFromLedger.toFixed(2)}
                      </p>
                    </div>

                    {/* Premium SVG Gradient Chart */}
                    <div className="w-full flex-1 min-h-[80px] relative mt-4 rounded-xl overflow-hidden bg-gray-50/50 border border-gray-100/50">
                      <svg
                        viewBox="0 0 100 40"
                        className="absolute bottom-0 w-full h-[80%] overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="chartGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#25d366"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="#25d366"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,35 Q10,15 25,25 T45,10 T65,20 T85,5 T100,15 L100,40 L0,40 Z"
                          fill="url(#chartGradient)"
                        />
                        <path
                          d="M0,35 Q10,15 25,25 T45,10 T65,20 T85,5 T100,15"
                          fill="none"
                          stroke="#25d366"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Review Request Modal UNCHANGED*/}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setPin("");
            setShowPinInput(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">
          <div className="bg-[#f8fcf9] px-6 py-8 flex flex-col items-center text-center border-b border-gray-100">
            <Avatar className="h-20 w-20 mb-4 border-4 border-white shadow-sm">
              <AvatarFallback className="bg-[#e2f3e8] text-[#1b4b36] font-bold text-2xl">
                {selectedRequest?.requester
                  ? getInitials(selectedRequest.requester.name)
                  : ""}
              </AvatarFallback>
            </Avatar>

            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="text-xl font-extrabold text-[#373d48] text-center">
                {selectedRequest?.requester?.name} is requesting money
              </DialogTitle>
            </DialogHeader>

            <p className="text-[32px] font-extrabold text-[#25d366] mt-2">
              {selectedRequest ? formatAmount(selectedRequest.amount) : ""}
            </p>
          </div>

          <div className="px-8 py-6 flex flex-col gap-5">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <User className="h-5 w-5 text-[#5d7079]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#5d7079] font-medium">From</span>
                <span className="font-bold text-[#373d48]">
                  {selectedRequest?.requester?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-5 w-5 text-[#5d7079]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#5d7079] font-medium">
                  Date requested
                </span>
                <span className="font-bold text-[#373d48]">
                  {selectedRequest ? formatDate(selectedRequest.createdAt) : ""}
                </span>
              </div>
            </div>

            {selectedRequest?.reason && (
              <div className="flex items-start gap-4 text-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <MessageSquare className="h-5 w-5 text-[#5d7079]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#5d7079] font-medium mb-1">Note</span>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-[#373d48] italic">
                    "{selectedRequest.reason}"
                  </div>
                </div>
              </div>
            )}

            {showPinInput && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-[#373d48]">
                  Enter PIN to confirm payment
                </Label>
                <Input
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
            )}
          </div>

          <DialogFooter className="px-6 py-6 bg-gray-50 flex sm:justify-between gap-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleDeclinePayment}
              disabled={declineMutation.isPending}
              className="flex-1 h-12 rounded-xl font-bold border-gray-200 text-[#373d48] hover:bg-gray-100"
            >
              {declineMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Decline"
              )}
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={payMutation.isPending}
              className="flex-1 h-12 rounded-xl bg-[#25d366] text-white hover:bg-[#20bd5b] font-bold"
            >
              {payMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showPinInput ? (
                "Confirm Payment"
              ) : (
                `Pay ${selectedRequest ? formatAmount(selectedRequest.amount) : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function RequestMoneyPage() {
  return (
    <KycGate featureName="Request Money">
      <RequestMoneyContent />
    </KycGate>
  );
}
