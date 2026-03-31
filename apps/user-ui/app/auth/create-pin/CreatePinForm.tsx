"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { SetPinInput, setPinSchema } from "@repo/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PinInput } from "@/components/shared/otp-inputs";
import { AuthOnboardingShell } from "@/components/shared/auth-onboarding-shell";

type Step = "create" | "confirm";

const WEAK_PINS = new Set([
  "0000","1111","2222","3333","4444","5555","6666","7777","8888","9999",
  "1234","2345","3456","4567","5678","6789","0123","9876","8765","7654",
  "6543","5432","4321","3210",
]);

function getPinStrength(pin: string): "weak" | "ok" | null {
  if (pin.length < 4) return null;
  if (WEAK_PINS.has(pin)) return "weak";
  return "ok";
}

export default function CreatePinForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("create");
  const [pinStrength, setPinStrength] = useState<"weak" | "ok" | null>(null);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<SetPinInput>({
    resolver: zodResolver(setPinSchema),
    defaultValues: { pin: "", confirmPin: "" },
  });

  const pin = watch("pin");
  const confirmPin = watch("confirmPin");

  useEffect(() => {
    setPinStrength(getPinStrength(pin));
  }, [pin]);

  const setupPinMutation = useMutation({
    mutationFn: authApi.setupPin,
    onSuccess: () => {
      toast.success("PIN created successfully!");
      router.replace("/auth/kyc");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message ?? "Failed to set PIN. Please try again.");
      setValue("pin", "");
      setValue("confirmPin", "");
      setPinStrength(null);
      setStep("create");
    },
  });

  async function handleCreateNext() {
    if (pinStrength === "weak") return;
    const valid = await trigger("pin");
    if (!valid) return;
    setStep("confirm");
  }

  return (
    <AuthOnboardingShell activeStep={2}>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
          Step 3 — Security PIN
        </p>
        <h2 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">
          {step === "create" ? "Create your PIN" : "Confirm your PIN"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "create"
            ? "Set a 4-digit PIN to secure your wallet transactions."
            : "Re-enter your PIN to confirm."}
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => setupPinMutation.mutate(data))}>
        <div className="flex flex-col items-center gap-5">
          {step === "create" ? (
            <>
              <div className="w-full">
                <p className="mb-3 text-sm font-medium text-foreground">Enter PIN</p>
                <PinInput
                  value={pin}
                  onChange={(v) => setValue("pin", v, { shouldValidate: true })}
                />
              </div>

              {pinStrength === "weak" && (
                <div className="flex w-full items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-3 text-sm text-warning-foreground">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">PIN is too weak</p>
                    <p className="text-xs mt-0.5 opacity-80">
                      Avoid sequential (1234) or repeated (1111) digits.
                    </p>
                  </div>
                </div>
              )}

              {errors.pin && pinStrength !== "weak" && (
                <p className="text-sm text-destructive text-center">{errors.pin.message}</p>
              )}

              {!errors.pin && pinStrength !== "weak" && (
                <p className="text-xs text-muted-foreground">Required for transfers over ₹500</p>
              )}

              <Button
                type="button"
                onClick={handleCreateNext}
                disabled={pin.length < 4 || pinStrength === "weak"}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide disabled:opacity-60"
              >
                CONTINUE
              </Button>
            </>
          ) : (
            <>
              <div className="w-full">
                <p className="mb-3 text-sm font-medium text-foreground">Re-enter PIN</p>
                <PinInput
                  value={confirmPin}
                  onChange={(v) => setValue("confirmPin", v, { shouldValidate: true })}
                />
              </div>

              {errors.confirmPin && (
                <p className="text-sm text-destructive text-center">{errors.confirmPin.message}</p>
              )}

              <Button
                type="submit"
                disabled={confirmPin.length < 4 || setupPinMutation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold tracking-wide"
              >
                {setupPinMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</>
                ) : (
                  "CONFIRM PIN"
                )}
              </Button>

              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setValue("pin", "");
                  setValue("confirmPin", "");
                  setPinStrength(null);
                  setStep("create");
                }}
              >
                Go back
              </button>
            </>
          )}
        </div>
      </form>
    </AuthOnboardingShell>
  );
}
