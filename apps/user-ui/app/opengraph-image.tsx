import { ImageResponse } from "next/og";

export const alt = "WalletX - Send & Manage Money Instantly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#0a1a10",
          fontFamily: "Arial Black, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Background glow blobs ── */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,211,102,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,211,102,0.10) 0%, transparent 70%)",
          }}
        />

        {/* ── LEFT PANEL ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 620,
            padding: "60px 56px",
            gap: 0,
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#25d366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                color: "#0a1a10",
              }}
            >
              W
            </div>
            <span
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              WalletX
            </span>
            {/* Verified badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(37,211,102,0.15)",
                border: "1px solid rgba(37,211,102,0.35)",
                borderRadius: 20,
                padding: "4px 12px",
                marginLeft: 4,
              }}
            >
              <span style={{ color: "#25d366", fontSize: 12, fontWeight: 700 }}>
                ✓ Secure
              </span>
            </div>
          </div>

          {/* Green divider */}
          <div
            style={{
              width: 48,
              height: 3,
              borderRadius: 2,
              backgroundColor: "#25d366",
              marginBottom: 28,
            }}
          />

          {/* Headline */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: 6,
            }}
          >
            SEND &amp; MANAGE
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: "#25d366",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: 22,
            }}
          >
            MONEY INSTANTLY
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 19,
              fontWeight: 400,
              color: "#7dc49a",
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            Link banks · P2P transfers · Spend analytics · KYC verified
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
            {[
              "⚡ Instant Send",
              "🏦 Bank Top-Up",
              "📊 Analytics",
              "🛡 KYC Secure",
              "💸 Withdraw",
            ].map((f) => (
              <div
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(37,211,102,0.12)",
                  border: "1px solid rgba(37,211,102,0.30)",
                  borderRadius: 20,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#25d366",
                }}
              >
                {f}
              </div>
            ))}
          </div>

          {/* CTA + Rating row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#25d366",
                borderRadius: 28,
                padding: "13px 28px",
                fontSize: 16,
                fontWeight: 900,
                color: "#0a1a10",
              }}
            >
              Sign up free →
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 700 }}>
                ⭐ 4.8 · 1.3M+ reviews
              </span>
              <span style={{ color: "#4a9a6a", fontSize: 12 }}>
                Google Play &amp; App Store
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "52px 48px 52px 16px",
            gap: 14,
          }}
        >
          {/* ── Wallet Card ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: 210,
              borderRadius: 28,
              background: "linear-gradient(135deg, #1d8a4a 0%, #0f5c2e 100%)",
              padding: "28px 30px 22px",
              boxShadow: "0 20px 60px rgba(37,211,102,0.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Card glow circle */}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 180,
                height: 180,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                right: 60,
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            />

            {/* Card top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Chip */}
              <div
                style={{
                  width: 40,
                  height: 30,
                  borderRadius: 6,
                  backgroundColor: "#f0c040",
                  opacity: 0.9,
                }}
              />
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700 }}>
                INR WALLET
              </span>
            </div>

            {/* Balance */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ color: "rgba(168,230,193,0.8)", fontSize: 12, fontWeight: 600 }}>
                TOTAL BALANCE
              </span>
              <span style={{ color: "#ffffff", fontSize: 36, fontWeight: 900, letterSpacing: "-1px" }}>
                ₹9,128.00
              </span>
            </div>

            {/* Card footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(168,230,193,0.75)", fontSize: 13, fontWeight: 600, letterSpacing: "2px" }}>
                •••• •••• •••• 6805
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#25d366",
                  borderRadius: 20,
                  padding: "4px 12px",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#0a1a10",
                }}
              >
                ● ACTIVE
              </div>
            </div>
          </div>

          {/* ── Transaction list ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            {/* tx 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "rgba(37,211,102,0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#25d366",
                  }}
                >
                  ↑
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>Send to Anisha</span>
                  <span style={{ color: "#4a9a6a", fontSize: 11 }}>P2P Transfer</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ color: "#f87171", fontSize: 14, fontWeight: 700 }}>-₹500</span>
                <span style={{ color: "#25d366", fontSize: 10, fontWeight: 700 }}>SUCCESS</span>
              </div>
            </div>

            {/* tx 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    backgroundColor: "rgba(37,211,102,0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "#25d366",
                  }}
                >
                  ↓
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}>Wallet Top-Up</span>
                  <span style={{ color: "#4a9a6a", fontSize: 11 }}>Axis Bank</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ color: "#4ade80", fontSize: 14, fontWeight: 700 }}>+₹2,000</span>
                <span style={{ color: "#25d366", fontSize: 10, fontWeight: 700 }}>SUCCESS</span>
              </div>
            </div>
          </div>

          {/* ── Bottom two mini cards ── */}
          <div style={{ display: "flex", gap: 14, width: "100%" }}>
            {/* Analytics mini card */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <span style={{ color: "#7dc49a", fontSize: 10, fontWeight: 700 }}>
                6-MONTH INCOME
              </span>
              <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 900 }}>
                ₹24,500
              </span>
              {/* Mini bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 28 }}>
                {[14, 20, 26, 18, 32, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: h,
                      borderRadius: 3,
                      backgroundColor: "#25d366",
                      opacity: 0.4 + i * 0.12,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* KYC mini card */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <span style={{ color: "#ffffff", fontSize: 14, fontWeight: 700 }}>
                KYC Verified
              </span>
              <span style={{ color: "#7dc49a", fontSize: 11 }}>
                Bank-grade security
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(37,211,102,0.15)",
                  border: "1px solid rgba(37,211,102,0.40)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#25d366",
                }}
              >
                ✓ 256-bit Encrypted
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom strip ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 32,
            backgroundColor: "rgba(0,0,0,0.30)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 60,
            paddingRight: 60,
          }}
        >
          <span style={{ color: "#4a9a6a", fontSize: 12, fontWeight: 500 }}>
            walletxx.vercel.app
          </span>
          <span style={{ color: "#2d6a45", fontSize: 12 }}>
            Send · Top Up · Analytics · Withdraw · Request
          </span>
          <span style={{ color: "#2d6a45", fontSize: 12 }}>© 2026 WalletX</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
