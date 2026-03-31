"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface SmartLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetchOnIdle?: boolean;
}

export function SmartLink({
  children,
  href,
  prefetchOnIdle = true,
  ...props
}: SmartLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [hasPrefetched, setPrefetched] = useState(false);

  const performPrefetch = () => {
    if (!hasPrefetched && typeof href === "string") {
      router.prefetch(href);
      setPrefetched(true);
    }
  };

  useEffect(() => {
    if (!prefetchOnIdle || hasPrefetched || typeof href !== "string") return;

    let requestIdleCallbackId: number | null = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Schedule prefetch on idle when visible
          if ("requestIdleCallback" in window) {
            requestIdleCallbackId = (window as any).requestIdleCallback(() => {
              performPrefetch();
            });
          } else {
            // Fallback for Safari
            setTimeout(performPrefetch, 200);
          }
          observer.disconnect();
        }
      });
    });

    if (linkRef.current) {
      observer.observe(linkRef.current);
    }

    return () => {
      observer.disconnect();
      if (requestIdleCallbackId && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(requestIdleCallbackId);
      }
    };
  }, [href, hasPrefetched, prefetchOnIdle]);

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseEnter={performPrefetch}
      onTouchStart={performPrefetch}
      prefetch={false} // Disable Next's default prefetch since we handle it smartly
      {...props}
    >
      {children}
    </Link>
  );
}
