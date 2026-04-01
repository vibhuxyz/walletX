"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  FileText,
  MapPin,
  Camera,
  PenLine,
  ArrowLeft,
  ChevronRight,
  Lock,
  Loader2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/wallet/useWalletQuery";
import { cn } from "@/lib/utils";

// ── Document type config ───────────────────────────────────────────────────────
const DOC_TYPES = [
  { id: "aadhaar",  label: "Aadhaar",         maxLen: 12, numericOnly: true,  placeholder: "1234 5678 9012",  pattern: /^\d{12}$/,         twoSided: true  },
  { id: "pan",      label: "PAN Card",         maxLen: 10, numericOnly: false, placeholder: "ABCDE1234F",      pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/, twoSided: false },
  { id: "passport", label: "Passport",         maxLen: 12, numericOnly: false, placeholder: "A1234567",        pattern: /^[A-Z0-9]{6,12}$/,  twoSided: false },
  { id: "dl",       label: "Driving License",  maxLen: 16, numericOnly: false, placeholder: "DL-1234567890",   pattern: /^[A-Z0-9\-]{6,16}$/, twoSided: true  },
] as const;

type DocTypeId = typeof DOC_TYPES[number]["id"];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ── KYC step definitions ───────────────────────────────────────────────────────
const KYC_STEPS = [
  {
    id: "identity",
    label: "Verify Your Identity",
    description: "We'll use your government-issued ID to confirm your financial identity.",
    icon: ShieldCheck,
    formTitle: "Verify Your Identity",
    formSubtitle: "Select your document type and enter your ID number.",
    infoText: "Why we need your ID number?",
    infoDetail: "Your ID number is encrypted and used only for regulatory identity verification. We never share it without your consent.",
  },
  {
    id: "document",
    label: "Upload a Valid Government-Issued ID",
    description: "Choose from your National ID, Driver's License, Passport, or Voter's Card.",
    icon: FileText,
    formTitle: "Upload Your ID Document",
    formSubtitle: "Upload a clear, well-lit photo of your document. Max 5 MB per image.",
    infoText: "Which documents are accepted?",
    infoDetail: "We accept Aadhaar, PAN cards, international passports, and driver's licences. Images must be clear and unobstructed.",
  },
  {
    id: "address",
    label: "Provide Proof of Address",
    description: "Upload a utility bill or enter your current residential address.",
    icon: MapPin,
    formTitle: "Provide Proof of Address",
    formSubtitle: "Enter or upload proof of your current residential address.",
    inputLabel: "Residential address",
    inputPlaceholder: "123 Main Street, City, State",
    infoText: "What counts as proof of address?",
    infoDetail: "Any government or utility document showing your full name and address dated within the last 3 months — electricity bill, bank statement, or tenancy agreement.",
  },
  {
    id: "selfie",
    label: "Take a Quick Live Selfie",
    description: "We'll match your face to your ID to make sure it's really you.",
    icon: Camera,
    formTitle: "Take a Quick Live Selfie",
    formSubtitle: "We'll compare your live photo with your submitted ID document.",
    inputLabel: "Selfie verification token",
    inputPlaceholder: "Camera capture token appears here",
    infoText: "How is my selfie used?",
    infoDetail: "Your selfie is processed by our biometric engine solely to match against your ID photo. It is deleted immediately after verification.",
  },
  {
    id: "signature",
    label: "Submit Your Signature",
    description: "Type it, draw it, or upload a scanned copy for verification.",
    icon: PenLine,
    formTitle: "Submit Your Signature",
    formSubtitle: "Provide your signature to complete the verification process.",
    inputLabel: "Signature / reference",
    inputPlaceholder: "Type or paste your signature token",
    infoText: "Why do we need your signature?",
    infoDetail: "Your signature is used as an additional layer of identity confirmation and will be stored securely in line with financial regulations.",
  },
] as const;

// ── Image upload slot ──────────────────────────────────────────────────────────
interface ImageSlot {
  file: File | null;
  previewUrl: string | null;
  error: string;
}

function ImageUploadBox({
  label,
  slot,
  onChange,
}: {
  label: string;
  slot: ImageSlot;
  onChange: (slot: ImageSlot) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onChange({ file: null, previewUrl: null, error: "Unsupported format. Use JPEG, PNG, or WebP." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onChange({ file: null, previewUrl: null, error: "Image quality is too high — please compress or upload a smaller image (max 5 MB)." });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onChange({ file, previewUrl, error: "" });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after clearing
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    onChange({ file: null, previewUrl: null, error: "" });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {slot.previewUrl ? (
        // Preview state
        <div className="relative rounded-xl overflow-hidden border-2 border-accent/30 bg-accent/5">
          <img
            src={slot.previewUrl}
            alt={label}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            {slot.file?.name}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all",
            slot.error
              ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/8"
              : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
          )}
        >
          {slot.error ? (
            <AlertCircle className="h-8 w-8 text-destructive/60" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground/40" />
          )}
          <p className="text-sm font-medium text-muted-foreground text-center px-4">
            {slot.error ? (
              <span className="text-destructive font-semibold">{slot.error}</span>
            ) : (
              <>
                <span className="text-accent font-semibold">Click to upload</span> or drag & drop
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground/60">JPEG, PNG, WebP · max 5 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AuthKycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Identity step state
  const [docType, setDocType] = useState<DocTypeId>("aadhaar");
  const [docError, setDocError] = useState("");

  // Document upload step state
  const emptySlot = (): ImageSlot => ({ file: null, previewUrl: null, error: "" });
  const [frontImage, setFrontImage] = useState<ImageSlot>(emptySlot());
  const [backImage, setBackImage] = useState<ImageSlot>(emptySlot());

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: qk.user });
  }, [queryClient]);

  const step = KYC_STEPS[activeStep];
  const isLastStep = activeStep === KYC_STEPS.length - 1;
  const stepNumber = String(activeStep + 1).padStart(2, "0");
  const totalSteps = String(KYC_STEPS.length).padStart(2, "0");

  const activeDocType = DOC_TYPES.find((d) => d.id === docType)!;

  // ── Step-specific validation ───────────────────────────────────
  function isStepReady(): boolean {
    if (activeStep === 0) {
      // Identity: need a valid ID number
      return inputValue.replace(/\s/g, "").length > 0;
    }
    if (activeStep === 1) {
      // Document upload: front always required; back only for two-sided docs
      const frontOk = !!frontImage.file && !frontImage.error;
      if (activeDocType.twoSided) return frontOk && !!backImage.file && !backImage.error;
      return frontOk;
    }
    // All other steps: just need non-empty text
    return inputValue.trim().length > 0;
  }

  async function handleContinue() {
    // Step 0 — validate ID number
    if (activeStep === 0) {
      const stripped = inputValue.replace(/\s/g, "");
      if (!stripped) { setDocError("Please enter your ID number."); return; }
      if (!activeDocType.pattern.test(stripped)) {
        setDocError(`Invalid ${activeDocType.label} number. Check the format and try again.`);
        return;
      }
      setDocError("");
    }

    // Step 1 — validate images
    if (activeStep === 1) {
      if (!frontImage.file) {
        setFrontImage((s) => ({ ...s, error: "Please upload the front side of your document." }));
        return;
      }
      if (activeDocType.twoSided && !backImage.file) {
        setBackImage((s) => ({ ...s, error: "Please upload the back side of your document." }));
        return;
      }
    }

    if (isLastStep) {
      setIsLoading(true);
      try {
        toast.success("KYC submitted! We'll notify you once verified.");
        router.push("/private/kyc");
      } catch {
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
      return;
    }

    // Advance
    setInputValue("");
    setShowInfo(false);
    setDocError("");
    setActiveStep((s) => s + 1);
  }

  function handleBack() {
    if (activeStep > 0) {
      setInputValue("");
      setShowInfo(false);
      setDocError("");
      setActiveStep((s) => s - 1);
    } else {
      toast.info("You can complete KYC later from your dashboard.");
      router.push("/dashboard");
    }
  }

  // ── Right panel content per step ──────────────────────────────
  function renderFormContent() {
    // Step 0 — identity: doc-type selector + ID number
    if (activeStep === 0) {
      return (
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-sm font-medium text-foreground">Document Type</label>
          <div className="flex flex-wrap gap-2 mb-1">
            {DOC_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                onClick={() => { setDocType(dt.id); setInputValue(""); setDocError(""); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  docType === dt.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground border-border hover:border-accent/50 hover:bg-accent/5"
                )}
              >
                {dt.label}
              </button>
            ))}
          </div>

          <label className="text-sm font-medium text-foreground mt-1">
            {activeDocType.label} Number
          </label>
          <Input
            value={inputValue}
            onChange={(e) => {
              let val = e.target.value;
              if (activeDocType.numericOnly) {
                val = val.replace(/\D/g, "").slice(0, activeDocType.maxLen);
              } else {
                val = val.toUpperCase().replace(/[^A-Z0-9\-]/g, "").slice(0, activeDocType.maxLen);
              }
              setInputValue(val);
              setDocError("");
            }}
            inputMode={activeDocType.numericOnly ? "numeric" : "text"}
            placeholder={activeDocType.placeholder}
            maxLength={activeDocType.maxLen}
            className="bg-card border-border h-12 text-base placeholder:text-muted-foreground/40 rounded-xl focus-visible:ring-accent/30"
          />
          {docError && <p className="text-xs text-destructive">{docError}</p>}
        </div>
      );
    }

    // Step 1 — document image upload
    if (activeStep === 1) {
      return (
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/20">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
            <p className="text-xs text-accent font-medium">
              Uploading {activeDocType.label}
              {activeDocType.twoSided ? " — front & back required" : " — one image required"}
            </p>
          </div>

          <ImageUploadBox
            label={activeDocType.twoSided ? "Front Side" : "Document Image"}
            slot={frontImage}
            onChange={setFrontImage}
          />

          {activeDocType.twoSided && (
            <ImageUploadBox
              label="Back Side"
              slot={backImage}
              onChange={setBackImage}
            />
          )}
        </div>
      );
    }

    // Steps 2–4 — plain text inputs
    const s = step as typeof KYC_STEPS[2];
    return (
      <div className="flex flex-col gap-2 mb-5">
        <label className="text-sm font-medium text-foreground">{s.inputLabel}</label>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={s.inputPlaceholder}
          className="bg-card border-border h-12 text-base placeholder:text-muted-foreground/40 rounded-xl focus-visible:ring-accent/30"
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border shadow-sm flex flex-col lg:flex-row min-h-[600px] bg-card">

      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div className="w-full lg:w-2/5 flex flex-col bg-card border-b lg:border-b-0 lg:border-r border-border px-8 py-8">

        <button
          type="button"
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors mb-6 self-start"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-foreground">
            <span className="text-base font-extrabold">{stepNumber}</span>
            <span className="text-muted-foreground"> of {totalSteps}</span>
          </p>
          <div className="flex items-center gap-1">
            {KYC_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeStep ? "w-7 bg-accent" : i < activeStep ? "w-4 bg-accent/40" : "w-4 bg-border"
                )}
              />
            ))}
          </div>
        </div>

        <h1 className="text-[22px] font-extrabold leading-snug tracking-tight text-foreground text-balance mb-2">
          One Last Step to Unlock Your Account
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {"We'll guide you through a few simple steps to verify your identity. It only takes a few minutes, and your data stays protected at every step."}
        </p>

        <ul className="flex flex-col gap-5">
          {KYC_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const isPending = i > activeStep;
            return (
              <li key={s.id} className="flex items-start gap-3.5">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5 transition-colors",
                  isActive  ? "bg-accent/10 text-accent border border-accent/20"
                  : isDone  ? "bg-primary/10 text-primary border border-primary/10"
                  : "bg-muted text-muted-foreground/30 border border-transparent"
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className={cn("text-sm font-semibold leading-tight", isPending ? "text-muted-foreground/40" : "text-foreground")}>
                    {s.label}
                  </p>
                  <p className={cn("text-xs leading-relaxed mt-0.5", isPending ? "text-muted-foreground/30" : "text-muted-foreground")}>
                    {s.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
      <div className="w-full lg:w-3/5 flex flex-col bg-muted/30 px-10 py-10">

        <div className="mb-8">
          <h2 className="text-[26px] font-extrabold tracking-tight text-foreground text-balance leading-snug">
            {step.formTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {step.formSubtitle}
          </p>
        </div>

        {renderFormContent()}

        {/* Info banner */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="flex items-center justify-between w-full rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning-foreground hover:bg-warning/15 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning-foreground/70" />
              {step.infoText}
            </span>
            <ChevronRight className={cn("h-4 w-4 text-warning-foreground/60 transition-transform duration-200", showInfo && "rotate-90")} />
          </button>
          {showInfo && (
            <div className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              {step.infoDetail}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <Button
          disabled={!isStepReady() || isLoading}
          onClick={handleContinue}
          className="w-full h-12 font-semibold tracking-wide text-sm rounded-xl transition-all bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait...</>
          ) : isLastStep ? "SUBMIT KYC" : "Continue"}
        </Button>

        <button
          type="button"
          onClick={() => {
            toast.info("You can complete KYC later from your dashboard.");
            router.push("/dashboard");
          }}
          className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now — complete KYC later from dashboard
        </button>
      </div>
    </div>
  );
}
