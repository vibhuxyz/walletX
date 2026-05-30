"use client";

import { useEffect } from "react";
import { generateDeviceFingerprint } from "./fingerprint";

/**
 * FingerprintInitializer Component
 * 
 * Silently generates and stores a stable device fingerprint on application load.
 * This is a core security measure used to identify trusted devices.
 */
export default function FingerprintInitializer() {
  useEffect(() => {
    async function init() {
      try {
        const fingerprint = await generateDeviceFingerprint();
        const currentId = localStorage.getItem("fw_device_id");
        
        // If the fingerprint changed (e.g. user cleared localStorage but it's the same device)
        // or if it's the first time, we set it.
        // The stable fingerprint ensures that even if they clear cache, 
        // they get the SAME ID back for the same hardware.
        if (currentId !== fingerprint) {
          localStorage.setItem("fw_device_id", fingerprint);
          console.debug("[Security] Device fingerprint synchronized");
        }
      } catch (error) {
        console.error("[Security] Failed to generate device fingerprint", error);
      }
    }
    
    init();
  }, []);

  return null;
}
