/**
 * Device Fingerprinting Utility
 * 
 * Generates a unique, stable fingerprint based on browser and hardware attributes.
 * This is used as a silent security measure to identify "known" devices.
 */

export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server-side";

  const components: string[] = [
    // Hardware & Screen
    window.screen.width.toString(),
    window.screen.height.toString(),
    window.screen.colorDepth.toString(),
    window.devicePixelRatio?.toString() || "1",
    (navigator as any).hardwareConcurrency?.toString() || "unknown",
    
    // Software & Environment
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    (navigator as any).platform || "unknown",
    
    // Browser Capabilities
    navigator.cookieEnabled ? "1" : "0",
    navigator.webdriver ? "1" : "0",
    
    // WebGL Vendor/Renderer (Hardware Signal)
    getWebGLFingerprint(),
  ];

  const fingerprintSource = components.join("|");
  
  // Use SubtleCrypto for a secure SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintSource);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext;
    if (!gl) return "no-webgl";
    
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "no-webgl-debug";
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}|${renderer}`;
  } catch (e) {
    return "webgl-error";
  }
}

export function getStaticDeviceName(): string {
  if (typeof window === "undefined") return "Server";
  
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "iOS Device";
  if (/Android/.test(ua)) return "Android Device";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Linux/.test(ua)) return "Linux PC";
  
  return "Desktop";
}
