"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, memo, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authApi, uploadImage } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth-context";
import {
  activateWalletSchema,
  type ActivateWalletInput,
  type IdType,
} from "@repo/zod-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  CheckCircle2,
  Camera,
  ShieldCheck,
  ArrowLeft,
  Trash2,
  User,
  CreditCard,
  ScanFace,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Step metadata ─────────────────────────────────────────────────────────────
const KYC_STEPS = [
  {
    label: "Personal Info",
    sublabel: "Provide your legal details",
    icon: User,
    mainTitle: "Let's Start With Your Details",
    mainDesc:
      "We'll guide you through a few simple steps to verify your identity. Provide your legal details as they appear on your official IDs.",
  },
  {
    label: "Upload Valid ID",
    sublabel: "Choose PAN, Aadhaar or Passport",
    icon: CreditCard,
    mainTitle: "Verify Your Identity",
    mainDesc:
      "Upload a valid, government-issued document to confirm your legal identity. Your data stays protected at every step.",
  },
  {
    label: "Take a Live Selfie",
    sublabel: "Match your face to your ID",
    icon: ScanFace,
    mainTitle: "Let's Verify It's You",
    mainDesc:
      "Take a quick live selfie so we can match it securely with your ID. Make sure you are in a well-lit area.",
  },
  {
    label: "Review & Submit",
    sublabel: "Confirm and finalise",
    icon: ClipboardCheck,
    mainTitle: "One Last Step to Unlock",
    mainDesc:
      "Review your information carefully before submitting. Once verified, your account and wallet will be fully active.",
  },
];

const STEP_FIELDS: Record<
  number,
  (keyof ActivateWalletInput | `address.${string}`)[]
> = {
  0: [
    "fullName",
    "dob",
    "address.line1",
    "address.city",
    "address.state",
    "address.pincode",
  ],
  1: ["idType", "idNumber", "idFrontUrl"],
  2: [],
};

const ID_META: Record<
  IdType,
  { label: string; placeholder: string; hint: string }
> = {
  PAN: {
    label: "PAN Number",
    placeholder: "ABCDE1234F",
    hint: "Format: ABCDE1234F",
  },
  AADHAAR: {
    label: "Aadhaar Number",
    placeholder: "123456789012",
    hint: "12-digit Aadhaar number",
  },
  PASSPORT: {
    label: "Passport Number",
    placeholder: "A1234567",
    hint: "Format: A1234567",
  },
};

// ── Image upload box ──────────────────────────────────────────────────────────
const ImageUploadBox = memo(function ImageUploadBox({
  label,
  value,
  onChange,
  onDelete,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background p-6 transition-colors hover:border-accent/30 cursor-pointer">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onChange(URL.createObjectURL(file));
        }}
      />
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <div onClick={() => inputRef.current?.click()} className="w-full">
        {value ? (
          <img
            src={value}
            alt={label}
            className="h-28 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Upload className="h-5 w-5 text-accent" />
            </div>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground text-center">
        {value ? "Click to change" : "Click to upload"}
      </p>
      {!value && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      )}
    </div>
  );
});

// ── KYC already done screen ───────────────────────────────────────────────────
function KycAlreadyDone() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(2);
  useEffect(() => {
    if (countdown <= 0) {
      router.replace("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            KYC Already Completed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your identity has already been verified and your wallet is active.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting in {countdown}s...
        </div>
        <Button variant="outline" onClick={() => router.replace("/dashboard")}>
          Go to dashboard now
        </Button>
      </div>
    </div>
  );
}

// ── Main KYC page ─────────────────────────────────────────────────────────────
export default function KycPage() {
  const router = useRouter();
  const { auth, login } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ActivateWalletInput>({
    resolver: zodResolver(activateWalletSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      address: { line1: "", city: "", state: "", pincode: "" },
      idType: undefined,
      idNumber: undefined,
      idFrontUrl: undefined,
      idBackUrl: undefined,
      selfieUrl: undefined,
    },
  });

  const idType = useWatch({ control, name: "idType" });
  const selfieUrl = useWatch({ control, name: "selfieUrl" });

  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const kycMutation = useMutation({
    mutationFn: async (data: ActivateWalletInput) => {
      setUploading(true);
      try {
        let idFrontUrl = data.idFrontUrl;
        let idBackUrl = data.idBackUrl;
        let selfieUrl = data.selfieUrl;
        if (data.idFrontUrl?.startsWith("blob:")) {
          setUploadProgress("Uploading ID front...");
          idFrontUrl = await uploadImage(data.idFrontUrl, "idFront");
        }
        if (data.idBackUrl?.startsWith("blob:")) {
          setUploadProgress("Uploading ID back...");
          idBackUrl = await uploadImage(data.idBackUrl, "idBack");
        }
        if (data.selfieUrl?.startsWith("blob:")) {
          setUploadProgress("Uploading selfie...");
          selfieUrl = await uploadImage(data.selfieUrl, "selfie");
        }
        setUploadProgress("Submitting KYC...");
        setUploading(false);
        return authApi.submitKyc({ ...data, idFrontUrl, idBackUrl, selfieUrl });
      } catch (err) {
        setUploading(false);
        setUploadProgress("");
        throw err;
      }
    },
    onSuccess: async (res) => {
      toast.success(
        res.data?.data?.message ?? "KYC approved! Wallet activated.",
      );
      await login();
    },
    onError: (err: AxiosError<{ message: string; error: string }>) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "KYC submission failed.",
      );
      setUploadProgress("");
    },
  });

  if (!auth.isLoading && auth.kycComplete) return <KycAlreadyDone />;

  const loading = kycMutation.isPending || isSubmitting || uploading;
  const allValues = watch();
  const total = KYC_STEPS.length;

  async function handleNext() {
    const fields = STEP_FIELDS[currentStep] as (keyof ActivateWalletInput)[];
    const valid = await trigger(fields);
    if (!valid) return;
    if (currentStep === 1) {
      const { idNumber, idFrontUrl } = watch();
      if (!idNumber && !idFrontUrl) {
        setError("idFrontUrl", {
          type: "manual",
          message:
            "Enter an ID number above or upload at least the front image",
        });
        return;
      }
      clearErrors("idFrontUrl");
    }
    setCurrentStep(currentStep + 1);
  }

  async function onSubmit(data: ActivateWalletInput) {
    kycMutation.mutate({
      ...data,
      idNumber: data.idNumber || undefined,
      idFrontUrl: data.idFrontUrl || undefined,
      idBackUrl: data.idBackUrl || undefined,
      selfieUrl: data.selfieUrl || undefined,
    });
  }

  // Segmented progress bar segments
  const segments = Array.from({ length: total }, (_, i) => i);

  return (
    // Outer wrapping main page background
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 sm:p-8 lg:p-12">
      {/* Inner floating KYC container matching the wireframe */}
      <div className="flex w-full max-w-6xl h-[88vh] min-h-175 max-h-225 flex-col lg:flex-row rounded-[2.5rem] bg-background shadow-2xl overflow-hidden border border-border/60">
        {/* ── Left panel — white ─────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[40%] flex-col bg-background px-12 py-10 overflow-y-auto no-scrollbar border-r border-border">
          {/* Header Row: Back button, step counter + progress */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-[15px] font-bold text-foreground tracking-wide">
                {String(currentStep + 1).padStart(2, "0")}
                <span className="text-muted-foreground font-normal ml-1">
                  of {String(total).padStart(2, "0")}
                </span>
              </p>
            </div>
            {/* Segmented progress dots */}
            <div className="flex items-center gap-1.5">
              {segments.map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStep
                      ? "w-8 bg-accent"
                      : i < currentStep
                        ? "w-4 bg-accent/40"
                        : "w-4 bg-border",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Heading & Description */}
          <div className="mb-12">
            <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-foreground text-balance mb-4">
              {KYC_STEPS[currentStep].mainTitle}
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed pr-6">
              {KYC_STEPS[currentStep].mainDesc}
            </p>
          </div>

          {/* Step list (No connecting lines, matching wireframe style) */}
          <ol className="flex flex-col gap-8">
            {KYC_STEPS.map((step, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              const Icon = step.icon;

              return (
                <li key={step.label} className="flex gap-5 items-center">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] transition-all",
                      isDone
                        ? "bg-success/10"
                        : isActive
                          ? "bg-accent/10 shadow-sm"
                          : "bg-muted/50",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-accent" : "text-muted-foreground/40",
                        )}
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center">
                    <p
                      className={cn(
                        "text-[15px] font-bold leading-tight",
                        isActive
                          ? "text-foreground"
                          : isDone
                            ? "text-foreground"
                            : "text-muted-foreground/50 font-semibold",
                      )}
                    >
                      {step.label}
                    </p>
                    <p
                      className={cn(
                        "text-[13px] mt-1 leading-relaxed",
                        isActive || isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/40",
                      )}
                    >
                      {step.sublabel}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ── Right panel — slightly tinted bg, forms ───────────────────────── */}
        <div className="flex flex-1 flex-col bg-[#F8F9FA] dark:bg-muted/10 lg:w-[55%] relative">
          {/* Mobile header (hidden on desktop) */}
          <div className="flex items-center px-6 pt-6 pb-2 lg:hidden">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="ml-4 flex items-center gap-1.5 flex-1 justify-end">
              {segments.map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStep
                      ? "w-8 bg-accent"
                      : i < currentStep
                        ? "w-4 bg-accent/40"
                        : "w-4 bg-border",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="px-6 lg:hidden mb-4 mt-2">
            <h1 className="text-2xl font-bold">
              {KYC_STEPS[currentStep].mainTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {KYC_STEPS[currentStep].mainDesc}
            </p>
          </div>

          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 lg:px-14 lg:py-16 pb-32 lg:pb-32">
            {/* ── STEP 0: Personal Info ─────────────────────────── */}
            {currentStep === 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[28px] font-extrabold tracking-tight text-foreground mb-2">
                  Personal Information
                </h2>
                <p className="text-[15px] text-muted-foreground mb-10">
                  Please provide your legal details exactly as they appear on
                  your ID.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="fullName"
                      className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Full legal name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Vikram Kumar"
                      className={cn(
                        "bg-background h-12 text-[15px] rounded-xl",
                        errors.fullName ? "border-destructive" : "",
                      )}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="dob"
                      className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Date of birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      className={cn(
                        "bg-background h-12 text-[15px] rounded-xl",
                        errors.dob ? "border-destructive" : "",
                      )}
                      {...register("dob")}
                    />
                    {errors.dob && (
                      <p className="text-xs text-destructive">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="line1"
                      className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Street address
                    </Label>
                    <Input
                      id="line1"
                      placeholder="123 Main St"
                      className={cn(
                        "bg-background h-12 text-[15px] rounded-xl",
                        errors.address?.line1 ? "border-destructive" : "",
                      )}
                      {...register("address.line1")}
                    />
                    {errors.address?.line1 && (
                      <p className="text-xs text-destructive">
                        {errors.address.line1.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="city"
                        className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="Motipur"
                        className={cn(
                          "bg-background h-12 rounded-xl",
                          errors.address?.city ? "border-destructive" : "",
                        )}
                        {...register("address.city")}
                      />
                      {errors.address?.city && (
                        <p className="text-xs text-destructive">
                          {errors.address.city.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="state"
                        className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="Bihar"
                        className={cn(
                          "bg-background h-12 rounded-xl",
                          errors.address?.state ? "border-destructive" : "",
                        )}
                        {...register("address.state")}
                      />
                      {errors.address?.state && (
                        <p className="text-xs text-destructive">
                          {errors.address.state.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="pincode"
                        className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        PIN Code
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="853111"
                        maxLength={6}
                        className={cn(
                          "bg-background h-12 rounded-xl",
                          errors.address?.pincode ? "border-destructive" : "",
                        )}
                        {...register("address.pincode")}
                      />
                      {errors.address?.pincode && (
                        <p className="text-xs text-destructive">
                          {errors.address.pincode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: ID Upload ─────────────────────────────── */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[28px] font-extrabold tracking-tight text-foreground mb-2">
                  Upload a Valid ID
                </h2>
                <p className="text-[15px] text-muted-foreground mb-10">
                  Choose from your PAN Card, Aadhaar, or Passport.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                      ID Type
                    </Label>
                    <Controller
                      control={control}
                      name="idType"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            setValue("idNumber", undefined);
                            setValue("idFrontUrl", undefined);
                            setValue("idBackUrl", undefined);
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "bg-background h-14 rounded-xl text-[15px]",
                              errors.idType ? "border-destructive" : "",
                            )}
                          >
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="PAN" className="py-3">
                              PAN Card
                            </SelectItem>
                            <SelectItem value="AADHAAR" className="py-3">
                              Aadhaar Card
                            </SelectItem>
                            <SelectItem value="PASSPORT" className="py-3">
                              Passport
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.idType && (
                      <p className="text-xs text-destructive">
                        {errors.idType.message}
                      </p>
                    )}
                  </div>

                  {idType && (
                    <div className="flex flex-col gap-2 mt-2">
                      <Label
                        htmlFor="idNumber"
                        className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {ID_META[idType].label}
                        <span className="ml-2 text-[11px] normal-case text-muted-foreground/70">
                          (or upload image below)
                        </span>
                      </Label>
                      <Input
                        id="idNumber"
                        placeholder={ID_META[idType].placeholder}
                        className={cn(
                          "bg-background h-14 rounded-xl text-[15px]",
                          errors.idNumber ? "border-destructive" : "",
                        )}
                        {...register("idNumber", {
                          onChange: (e) => {
                            e.target.value = e.target.value.toUpperCase();
                            if (e.target.value) clearErrors("idFrontUrl");
                          },
                        })}
                      />
                      {errors.idNumber ? (
                        <p className="text-xs text-destructive">
                          {errors.idNumber.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {ID_META[idType].hint}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 py-2">
                    <div className="h-px flex-1 bg-border/80" />
                    <span>OR Upload Document Photos</span>
                    <div className="h-px flex-1 bg-border/80" />
                  </div>

                  <div
                    className={`grid gap-5 ${idType === "PASSPORT" ? "grid-cols-1" : "sm:grid-cols-2"}`}
                  >
                    <Controller
                      control={control}
                      name="idFrontUrl"
                      render={({ field }) => (
                        <ImageUploadBox
                          label={
                            idType === "PASSPORT"
                              ? "Passport photo page"
                              : "Front side"
                          }
                          value={field.value ?? ""}
                          onChange={(url) => {
                            field.onChange(url);
                            if (url) clearErrors("idFrontUrl");
                          }}
                          onDelete={() => {
                            setValue("idFrontUrl", undefined);
                            toast.info("ID front removed");
                          }}
                        />
                      )}
                    />
                    {idType !== "PASSPORT" && (
                      <Controller
                        control={control}
                        name="idBackUrl"
                        render={({ field }) => (
                          <ImageUploadBox
                            label="Back side"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onDelete={() => {
                              setValue("idBackUrl", undefined);
                              toast.info("ID back removed");
                            }}
                          />
                        )}
                      />
                    )}
                  </div>
                  {errors.idFrontUrl && (
                    <p className="text-xs text-destructive">
                      {errors.idFrontUrl.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: Selfie ────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[28px] font-extrabold tracking-tight text-foreground mb-2">
                  Take a Quick Live Selfie
                  <span className="ml-3 text-sm font-medium text-muted-foreground/60">
                    (Optional)
                  </span>
                </h2>
                <p className="text-[15px] text-muted-foreground mb-12">
                  We'll match your face to your ID to make sure it's really you.
                </p>
                <div className="flex flex-col items-center gap-8 py-6">
                  <Controller
                    control={control}
                    name="selfieUrl"
                    render={({ field }) => (
                      <>
                        <input
                          ref={selfieInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            field.onChange(URL.createObjectURL(file));
                          }}
                        />
                        <div className="relative">
                          {field.value && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue("selfieUrl", undefined);
                                toast.info("Selfie removed");
                              }}
                              className="absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl transition-transform hover:scale-105"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div
                            className="flex h-56 w-56 cursor-pointer items-center justify-center rounded-full border-[5px] border-dashed border-border bg-background overflow-hidden transition-all hover:border-accent/50 hover:bg-accent/5"
                            onClick={() => selfieInputRef.current?.click()}
                          >
                            {field.value ? (
                              <img
                                src={field.value}
                                alt="Selfie preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Camera className="h-16 w-16 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-[17px] font-bold text-foreground">
                      {selfieUrl
                        ? "Looking good!"
                        : "Position your face in the circle"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Make sure your face is well-lit and clearly visible
                      without accessories.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    size="lg"
                    className="bg-background rounded-xl h-12 px-8 font-semibold"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {selfieUrl ? "Retake photo" : "Upload photo"}
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-[28px] font-extrabold tracking-tight text-foreground mb-2">
                  Review &amp; Submit
                </h2>
                <p className="text-[15px] text-muted-foreground mb-10">
                  Please check your information before sending it for
                  verification.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="rounded-[20px] bg-background border border-border shadow-sm p-6">
                    <div className="flex flex-col gap-5">
                      {[
                        { label: "Name", value: allValues.fullName },
                        { label: "Date of birth", value: allValues.dob },
                        {
                          label: "Address",
                          value: `${allValues.address?.line1}, ${allValues.address?.city}, ${allValues.address?.state} – ${allValues.address?.pincode}`,
                        },
                        { label: "ID Type", value: allValues.idType },
                        ...(allValues.idNumber
                          ? [
                              {
                                label: allValues.idType
                                  ? ID_META[allValues.idType].label
                                  : "ID Number",
                                value: allValues.idNumber,
                              },
                            ]
                          : []),
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0"
                        >
                          <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                            {label}
                          </span>
                          <span className="text-[15px] font-bold text-foreground sm:text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-[20px] bg-success/5 border border-success/20 p-6">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
                    <div>
                      <p className="text-[15px] font-bold text-foreground">
                        Documents successfully attached
                      </p>
                      <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                        {[
                          allValues.idFrontUrl && "Front ID image",
                          allValues.idBackUrl && "Back ID image",
                          allValues.selfieUrl && "Selfie image",
                        ]
                          .filter(Boolean)
                          .join(", ") || "No images uploaded"}
                        {" — "}
                        {allValues.idNumber
                          ? "ID number provided"
                          : "via image upload"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer navigation — Sticky to the bottom ── */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/60 bg-[#F8F9FA]/90 dark:bg-background/90 backdrop-blur-md px-6 py-5 lg:px-14 flex items-center justify-between">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground h-12 px-6 rounded-xl font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-10 rounded-xl font-bold text-[15px] transition-all"
              >
                {currentStep === 2 && !selfieUrl
                  ? "Skip & Continue"
                  : "Continue"}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(onSubmit)()}
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-10 rounded-xl font-bold text-[15px] transition-all"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {uploadProgress || "Uploading..."}
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Submit Verification
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
