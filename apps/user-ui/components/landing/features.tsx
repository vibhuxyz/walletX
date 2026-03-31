import Image from "next/image"
import Link from "next/link"
import { Star, Landmark, Headphones, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Features() {
  return (
    <>
      {/* Trust section */}
      <section id="features" className="border-t border-border/40 bg-card px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-5xl lg:text-6xl">
            Take control of your money
          </h2>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                Winner of <strong className="underline underline-offset-2">Best Fintech 2026</strong>
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Landmark className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                Bank-grade encryption and <strong className="underline underline-offset-2">256-bit security</strong>
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                24/7 customer support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Split feature 1 */}
      <section className="bg-card px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-5xl">
                Send money
                <br />
                via email
              </h3>
              <p className="mt-5 max-w-md text-muted-foreground leading-relaxed">
                Pay anyone using just their email address. No account numbers or
                routing details needed, just like UPI.
              </p>

              <div className="mt-8 flex flex-col gap-6">
                <div className="flex gap-4 border-t border-border/40 pt-6">
                  <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">Quick transfers under $500</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Send instantly without PIN verification. Fast payments for
                      everyday use.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-border/40 pt-6">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">PIN-protected large transfers</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Amounts over $500 are secured with your wallet PIN. Every
                      transaction encrypted end-to-end.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button variant="outline" asChild className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href="/auth/register">Start sending money</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/lifestyle-payment.jpg"
                alt="Making a payment with WalletX"
                width={600}
                height={500}
                className="h-[360px] w-full object-cover lg:h-[480px]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
