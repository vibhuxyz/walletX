"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Landmark,
  Plus,
  Building2,
  User,
  Hash,
  MapPin,
  Loader2,
  IndianRupee,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Mail,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import {
  createBankAccount,
  getBankAccounts,
  DEMO_BANKS,
  type CreateBankAccountPayload,
  type BankAccount,
} from "@/lib/api/demoBankApi";
import { getApiError } from "@/lib/api/transfer";

interface BankFormValues {
  bankName: string;
  accountHolder: string;
  email: string;
  phone: string;
  accountType: "SAVINGS" | "CURRENT";
  initialBalance: string;
}

function extractFieldErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    errors.forEach((err: any) => {
      if (err.path && err.path.length > 0) {
        const fieldName = err.path[err.path.length - 1];
        fieldErrors[fieldName] = err.message;
      }
    });
  }

  if (error.response?.data?.error) {
    const errorMsg = error.response.data.error;
    if (errorMsg.includes("email")) {
      fieldErrors.email = errorMsg;
    } else if (errorMsg.includes("phone")) {
      fieldErrors.phone = errorMsg;
    } else if (errorMsg.includes("account")) {
      fieldErrors.accountHolder = errorMsg;
    }
  }

  return fieldErrors;
}



function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label || "Text"} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted/80 transition-colors"
      title={`Copy ${label || "text"}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}

// Account Card Component 

function AccountCard({ account }: { account: BankAccount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className="border-border/30 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
        <CardContent className="p-5">
          {/* Collapsed View  */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">
                  {account.bankName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {account.accountHolder}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {account.accountType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={account.status === "ACTIVE" ? "default" : "secondary"}
                className="text-xs"
              >
                {account.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 pt-3 border-t border-border/30">
                  {/* Account Number */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      Account Number
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-mono font-semibold text-foreground">
                        {account.accountNumber}
                      </span>
                      <CopyButton
                        text={account.accountNumber}
                        label="Account Number"
                      />
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      IFSC Code
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-mono font-semibold text-foreground">
                        {account.ifscCode}
                      </span>
                      <CopyButton text={account.ifscCode} label="IFSC Code" />
                    </div>
                  </div>

                  {/* Account Holder */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Account Holder
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-foreground">
                        {account.accountHolder}
                      </span>
                      <CopyButton
                        text={account.accountHolder}
                        label="Account Holder"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-foreground truncate max-w-[200px]">
                        {account.email}
                      </span>
                      <CopyButton text={account.email} label="Email" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Phone
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm font-mono text-foreground">
                        {account.phone}
                      </span>
                      <CopyButton text={account.phone} label="Phone" />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center justify-between py-2 border-b border-border/20">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <IndianRupee className="h-3 w-3" />
                      Balance
                    </span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-primary">
                        ₹{parseFloat(account.balance).toLocaleString("en-IN")}
                      </span>
                      <CopyButton text={account.balance} label="Balance" />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-3 w-3" />
                      Branch
                    </span>
                    <div className="flex items-center">
                      <span className="text-sm text-foreground">
                        {account.branch}
                      </span>
                      <CopyButton text={account.branch} label="Branch" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

//  Main Page Component 

export default function BankAccountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<BankFormValues>({
    defaultValues: {
      bankName: "",
      accountHolder: "",
      email: "",
      phone: "",
      accountType: "SAVINGS",
      initialBalance: "10000",
    },
  });

  const bankName = watch("bankName");
  const accountType = watch("accountType");

  //  Fetch Accounts 
  const { data, isLoading, error } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: getBankAccounts,
    staleTime: 1000 * 60 * 5,
  });

  const accounts = data?.accounts ?? [];

  //  Create Account Mutation
  const createMutation = useMutation({
    mutationFn: (values: BankFormValues) => {
      const payload: CreateBankAccountPayload = {
        bankName: values.bankName as any,
        accountHolder: values.accountHolder,
        email: values.email,
        phone: values.phone,
        accountType: values.accountType,
        initialBalance: values.initialBalance,
      };
      return createBankAccount(payload);
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bank account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      setServerErrors({});
      reset();
    },
    onError: (err: any) => {
      // Extract field-specific errors
      const fieldErrors = extractFieldErrors(err);

      if (Object.keys(fieldErrors).length > 0) {
        // Set field-specific errors
        setServerErrors(fieldErrors);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as any, {
            type: "server",
            message: message,
          });
        });
        toast.error("Please fix the errors in the form");
      } else {
        // General error
        const errorMessage = getApiError(err);
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = (values: BankFormValues) => {
    // Clear previous server errors
    setServerErrors({});
    clearErrors();

    // Client-side validation
    const validationErrors: Record<string, string> = {};

    if (!values.bankName) {
      validationErrors.bankName = "Please select a bank";
    }

    if (!values.accountHolder || values.accountHolder.trim().length < 3) {
      validationErrors.accountHolder =
        "Account holder name must be at least 3 characters";
    }

    if (!values.email) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      validationErrors.email = "Invalid email address";
    }

    if (!values.phone) {
      validationErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(values.phone)) {
      validationErrors.phone =
        "Invalid phone number (10 digits, starts with 6-9)";
    }

    if (!values.initialBalance) {
      validationErrors.initialBalance = "Initial balance is required";
    } else {
      const balance = parseFloat(values.initialBalance);
      if (isNaN(balance)) {
        validationErrors.initialBalance = "Invalid amount";
      } else if (balance < 0) {
        validationErrors.initialBalance = "Balance must be at least ₹0";
      } else if (balance > 1000000) {
        validationErrors.initialBalance = "Balance cannot exceed ₹10,00,000";
      }
    }

    // If there are validation errors, show them and stop
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as any, {
          type: "manual",
          message,
        });
      });
      toast.error("Please fill all required fields correctly");
      return;
    }

    createMutation.mutate(values);
  };

  const isFormDisabled = createMutation.isPending || isSubmitting;

  return (
    <div className="w-full">
      {/* Header with Link Bank Button */}
      <div className="mb-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">
            Demo Bank Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create fake bank accounts for testing wallet features
          </p>
        </motion.div>

        {/* Link Bank Account Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => router.push("/dashboard/add-bank-account")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Link to Wallet
          </Button>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: Create Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/30 sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Plus className="h-5 w-5 text-primary" />
                Create Bank Account
              </CardTitle>
              <CardDescription>
                Fill in the details to create a demo bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={bankName}
                    onValueChange={(v) => {
                      setValue("bankName", v);
                      clearErrors("bankName");
                    }}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger
                      className={`bg-secondary/50 border-border/30 ${
                        errors.bankName ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankName && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.bankName.message}</span>
                    </div>
                  )}
                </div>

                {/* Account Holder */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accountHolder"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Account Holder Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountHolder"
                    placeholder="Enter full name"
                    disabled={isFormDisabled}
                    className={`bg-secondary/50 border-border/30 ${
                      errors.accountHolder ? "border-destructive" : ""
                    }`}
                    {...register("accountHolder", {
                      required: "Account holder name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                      onChange: () => clearErrors("accountHolder"),
                    })}
                  />
                  {errors.accountHolder && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.accountHolder.message}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    disabled={isFormDisabled}
                    className={`bg-secondary/50 border-border/30 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                      onChange: () => clearErrors("email"),
                    })}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.email.message}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    disabled={isFormDisabled}
                    className={`bg-secondary/50 border-border/30 ${
                      errors.phone ? "border-destructive" : ""
                    }`}
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message:
                          "Invalid phone number (10 digits, starts with 6-9)",
                      },
                      onChange: () => clearErrors("phone"),
                    })}
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.phone.message}</span>
                    </div>
                  )}
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Account Type
                  </Label>
                  <RadioGroup
                    value={accountType}
                    onValueChange={(v) =>
                      setValue("accountType", v as "SAVINGS" | "CURRENT")
                    }
                    disabled={isFormDisabled}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="SAVINGS" id="savings" />
                      <Label htmlFor="savings" className="font-normal">
                        Savings
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="CURRENT" id="current" />
                      <Label htmlFor="current" className="font-normal">
                        Current
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <Label
                    htmlFor="initialBalance"
                    className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Initial Balance (₹){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    placeholder="10000"
                    min="0"
                    max="1000000"
                    step="100"
                    disabled={isFormDisabled}
                    className={`bg-secondary/50 border-border/30 ${
                      errors.initialBalance ? "border-destructive" : ""
                    }`}
                    {...register("initialBalance", {
                      required: "Initial balance is required",
                      min: {
                        value: 0,
                        message: "Balance must be at least ₹0",
                      },
                      max: {
                        value: 1000000,
                        message: "Balance cannot exceed ₹10,00,000",
                      },
                      onChange: () => clearErrors("initialBalance"),
                    })}
                  />
                  {errors.initialBalance && (
                    <div className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.initialBalance.message}</span>
                    </div>
                  )}
                  {!errors.initialBalance && (
                    <p className="text-xs text-muted-foreground">
                      Maximum: ₹10,00,000
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Account number, IFSC code, and branch will be
                    auto-generated. The account will be instantly active.
                  </p>
                </div>

                {/* Server Error Summary */}
                {Object.keys(serverErrors).length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive mb-1">
                        Validation Errors
                      </p>
                      <ul className="text-xs text-destructive space-y-1">
                        {Object.entries(serverErrors).map(
                          ([field, message]) => (
                            <li key={field}>• {message}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT: Accounts List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Your Bank Accounts
              </h2>
              <p className="text-sm text-muted-foreground">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""}{" "}
                created
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/30">
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">
                  Failed to load accounts
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && accounts.length === 0 && (
            <Card className="border-border/30 bg-muted/20">
              <CardContent className="p-12 text-center">
                <Landmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm font-semibold text-foreground mb-1">
                  No bank accounts yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Create your first demo bank account using the form
                </p>
              </CardContent>
            </Card>
          )}

          {/* Accounts List */}
          {!isLoading && !error && accounts.length > 0 && (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {accounts.map((account) => (
                  <AccountCard key={account.accountId} account={account} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
