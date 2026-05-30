# WalletX - Secure Financial Microservices

WalletX is a modern, high-security financial platform built on a microservices architecture. It prioritizes fraud prevention and user safety through advanced technical measures.

## 🛡️ Security Measures: Device Fingerprinting

Inspired by industry leaders like **Wise**, WalletX implements a silent, server-side device fingerprinting system. This technology ensures that login attempts come from recognized and trusted devices, providing a seamless experience for legitimate users while blocking unauthorized access.

### How it Works

1.  **Silent Data Collection**:
    When a user interacts with the web platform, we silently collect a variety of stable hardware and software signals:
    *   **Hardware**: Screen resolution, color depth, and CPU core count (`hardwareConcurrency`).
    *   **GPU Fingerprint**: We use WebGL vendor and renderer information to identify specific graphics hardware.
    *   **Environment**: Time zone, system language, and operating system.
    *   **Network**: The user's IP address and subnet are tracked for every request.

2.  **Stable Hashing**:
    These signals are processed through a cryptographic SHA-256 algorithm to generate a unique "Device Fingerprint." Unlike traditional cookies, this fingerprint is derived from the device's unique technical profile. Even if a user clears their browser cache or cookies, the fingerprint remains consistent because it's based on the underlying hardware and environment.

3.  **Secure Server-Side Verification**:
    The fingerprint is sent via secure headers (`X-Device-Id`) to our `auth-service`. The backend maintains a `trustedDevice` database for every user. 

4.  **Step-Up Authentication (MFA)**:
    *   **Known Device**: If the fingerprint and network profile match a previously trusted device, the user can log in smoothly.
    *   **New Device**: If a user logs in from a new computer or a significantly different network (e.g., a different city or VPN), the system automatically triggers **Step-Up Authentication**. The user is required to verify their identity via a one-time password (OTP) sent to their registered email.
    *   **Automatic Trust**: Once the OTP is verified, the new device fingerprint is added to the user's trusted list.

### Benefits
*   **Account Takeover Protection**: Even if a fraudster steals a user's password, they cannot easily bypass the device trust requirement.
*   **Reduced Friction**: Legitimate users on known devices rarely need to deal with redundant MFA prompts.
*   **Fraud Detection**: We can identify and block known "bad" devices or suspicious login patterns before they reach sensitive account data.

---

## Technical Stack
*   **Frontend**: Next.js (TypeScript), Tailwind CSS
*   **Backend**: Node.js (Express), Prisma (PostgreSQL & MongoDB)
*   **In-Memory**: Redis (Caching, Rate Limiting, OTP Tracking)
*   **Message Broker**: RabbitMQ (Asynchronous events)
*   **Infrastructure**: Docker, TurboRepo
