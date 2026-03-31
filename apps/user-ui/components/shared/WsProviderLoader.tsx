"use client";

/**
 * WsProviderLoader — thin client-component shell.
 *
 * `next/dynamic` with `ssr: false` is only allowed inside Client Components.
 * This file isolates that call so the Server Component layout can import it
 * without triggering the "ssr: false not allowed in Server Components" error.
 *
 * BroadcastChannel (used inside WsProvider → BroadcastLeader) is a
 * browser-only API and must never run during Edge SSR, hence ssr: false.
 */

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const WsProvider = dynamic(
  () => import("./WsProvider").then((m) => m.WsProvider),
  { ssr: false }
);

export function WsProviderLoader({ children }: { children: ReactNode }) {
  return <WsProvider>{children as any}</WsProvider>;
}
