import { UserPlus, Landmark, Send } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in under a minute. Complete KYC to unlock your full wallet and higher transfer limits.",
  },
  {
    step: "02",
    icon: Landmark,
    title: "Link your bank",
    description:
      "Securely connect bank accounts. Verify with your bank's OTP for maximum security.",
  },
  {
    step: "03",
    icon: Send,
    title: "Send & receive",
    description:
      "Transfer money via email instantly. Small amounts go in seconds, larger ones secured by PIN.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/40 bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-4xl font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-5xl lg:text-6xl">
          Get started in minutes
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-muted-foreground text-pretty">
          From signup to your first transfer. No complicated setup required.
        </p>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Step {step.step}
              </span>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
