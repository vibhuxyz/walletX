import Image from "next/image";
import { Star } from "lucide-react";
import { HeroActions } from "@/components/landing/hero-actions";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-card px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
            </div>
            <span>
              <strong className="text-foreground">4.8</strong> on App Store{" "}
              <span className="text-muted-foreground">152K reviews</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
            </div>
            <span>
              <strong className="text-foreground">4.8</strong> on Google Play{" "}
              <span className="text-muted-foreground">1.3M reviews</span>
            </span>
          </div>
        </div>

        <h1 className="text-center text-5xl font-black uppercase leading-[0.9] tracking-tighter text-foreground md:text-7xl lg:text-[6.5rem]">
          Send and manage
          <br />
          money instantly
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-center text-lg text-muted-foreground text-pretty">
          Link your bank accounts, send money via email to anyone, and track all
          your finances in one place. Fast, secure, and simple.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <HeroActions />
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl">
          <Image
            src="/images/hero-phone.jpg"
            alt="Person using FineWallet on their smartphone"
            width={1200}
            height={600}
            className="h-[320px] w-full object-cover md:h-[480px]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
