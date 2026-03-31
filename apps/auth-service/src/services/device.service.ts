import { prismaPostgres } from "@repo/db-postgres";
import { redis, RedisKeys, RedisTTL } from "@repo/redis";
import { Logger } from "@repo/libs";
import { nanoid } from "nanoid";
import crypto from "crypto";

const logger = new Logger("DeviceService");

export async function isDeviceTrusted(
  userId: string,
  deviceId: string,
  currentIp: string,
): Promise<boolean> {
  const cacheKey = RedisKeys.DEVICE_TRUST(userId, deviceId);

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached === "1") {
    logger.debug("Device trust cache hit", { userId, deviceId });
    return true;
  }

  if (cached === "0") {
    logger.debug("Device trust cache hit (not trusted)", { userId, deviceId });
    return false;
  }

  // Cache miss - query database
  const device = await prismaPostgres.trustedDevice.findUnique({
    where: {
      userId_deviceId: {
        userId,
        deviceId,
      },
    },
    select: {
      isTrusted: true,
      ipAddress: true,
    },
  });

  if (!device) {
    // Device not found - not trusted
    await redis.set(cacheKey, "0", "EX", RedisTTL.CACHE_DEVICE);
    return false;
  }

  if (!device.isTrusted) {
    // device exists but not trusted
    await redis.set(cacheKey, "0", "EX", RedisTTL.CACHE_DEVICE);
    return false;
  }

  // check if IP is in  subnet
  const isSameSubnet = checkSubnetMatch(device.ipAddress, currentIp);

  if (isSameSubnet) {
    // trust the device and cache the result
    await redis.set(cacheKey, "1", "EX", RedisTTL.CACHE_DEVICE);
    logger.debug("Device is trusted", { userId, deviceId });
    return true;
  }

  // different subnet - don't trust even if device is in db
  logger.warn("Device trusted but IP subnet changed", {
    userId,
    deviceId,
    storedIp: device.ipAddress,
    currentIp,
  });

  await redis.set(cacheKey, "0", "EX", RedisTTL.CACHE_DEVICE);
  return false;
}

// register new device
export async function registerDevice(
  userId: string,
  deviceId: string,
  deviceName: string,
  ipAddress: string,
  isTrusted: boolean = false,
): Promise<{ id: string; deviceId: string }> {
  // check if device already exists
  const existing = await prismaPostgres.trustedDevice.findUnique({
    where: {
      userId_deviceId: {
        userId,
        deviceId,
      },
    },
  });

  if (existing) {
    // update existing device
    const updated = await prismaPostgres.trustedDevice.update({
      where: { id: existing.id },
      data: {
        deviceName,
        ipAddress,
        isTrusted,
        lastUsedAt: new Date(),
      },
      select: { id: true, deviceId: true },
    });

    logger.info("Device updated", { userId, deviceId });
    return updated;
  }

  // create new device
  const device = await prismaPostgres.trustedDevice.create({
    data: {
      id: `dev_${nanoid(21)}`,
      userId,
      deviceId,
      deviceName,
      ipAddress,
      isTrusted,
    },
    select: { id: true, deviceId: true },
  });

  logger.info("Device registered", { userId, deviceId, isTrusted });
  return device;
}

function checkSubnetMatch(storedIp: string, currentIp: string): boolean {
  try {
    // handle IPv4
    if (storedIp.includes(".") && currentIp.includes(".")) {
      // get first 3 octets subnet /24
      const storedSubnet = storedIp.split(".").slice(0, 3).join(".");
      const currentSubnet = currentIp.split(".").slice(0, 3).join(".");
      return storedSubnet === currentSubnet;
    }

    // gandle IPv6 simplified check first 4 groups
    if (storedIp.includes(":") && currentIp.includes(":")) {
      const storedSubnet = storedIp.split(":").slice(0, 4).join(":");
      const currentSubnet = currentIp.split(":").slice(0, 4).join(":");
      return storedSubnet === currentSubnet;
    }

    // mixed ip versions - not same subnet
    return false;
  } catch (error) {
    logger.error("Error checking subnet match", error);
    return false;
  }
}

function maskIpAddress(ip: string): string {
  try {
    if (ip.includes(".")) {
      // ipv4
      const parts = ip.split(".");
      parts[3] = "***";
      return parts.join(".");
    }

    if (ip.includes(":")) {
      // ipv6
      const parts = ip.split(":");
      parts[parts.length - 1] = "***";
      return parts.join(":");
    }

    return "***";
  } catch {
    return "***";
  }
}

// clear chased devie is trust for user
export async function invalidateDeviceCache(userId: string): Promise<void> {
  // get all devices for user
  const devices = await prismaPostgres.trustedDevice.findMany({
    where: { userId },
    select: { deviceId: true },
  });

  // delete all cache entries
  const pipeline = redis.pipeline();
  for (const device of devices) {
    pipeline.del(RedisKeys.DEVICE_TRUST(userId, device.deviceId));
  }
  await pipeline.exec();

  logger.info("Device cache invalidated", { userId, count: devices.length });
}

// get device info
export async function getDeviceInfo(
  userId: string,
  deviceId: string,
): Promise<{
  id: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  isTrusted: boolean;
  lastUsedAt: Date;
  createdAt: Date;
} | null> {
  const device = await prismaPostgres.trustedDevice.findUnique({
    where: {
      userId_deviceId: {
        userId,
        deviceId,
      },
    },
    select: {
      id: true,
      deviceId: true,
      deviceName: true,
      ipAddress: true,
      isTrusted: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  if (!device) {
    return null;
  }

  //@ts-ignore
  return {
    ...device,
    ipAddress: maskIpAddress(device.ipAddress),
  };
}

// count trusted devices for user
export async function countTrustedDevices(userId: string): Promise<number> {
  return prismaPostgres.trustedDevice.count({
    where: {
      userId,
      isTrusted: true,
    },
  });
}

// clean old device for the user
export async function cleanOldDevices(
  userId: string,
  daysInactive: number = 90,
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  const result = await prismaPostgres.trustedDevice.deleteMany({
    where: {
      userId,
      lastUsedAt: {
        lt: cutoffDate,
      },
    },
  });

  if (result.count > 0) {
    await invalidateDeviceCache(userId);
    logger.info("Old devices cleaned", {
      userId,
      count: result.count,
      daysInactive,
    });
  }

  return result.count;
}

//validates that a device fingerprint is in correct format

export function validateDeviceFingerprint(deviceId: string): {
  valid: boolean;
  error?: string;
} {
  if (!deviceId) {
    return { valid: false, error: "Device ID is required" };
  }

  if (deviceId.length < 10) {
    return {
      valid: false,
      error: "Device ID too short (minimum 10 characters)",
    };
  }

  if (deviceId.length > 200) {
    return {
      valid: false,
      error: "Device ID too long (maximum 200 characters)",
    };
  }

  // Check for valid characters
  if (!/^[a-zA-Z0-9_-]+$/.test(deviceId)) {
    return { valid: false, error: "Device ID contains invalid characters" };
  }

  return { valid: true };
}

// Generates a device fingerprint from request headers
// but can be used as a fallback

export function generateServerSideFingerprint(req: any): string {

  const components = [
    req.headers["user-agent"] || "",
    req.headers["accept-language"] || "",
    req.headers["accept-encoding"] || "",
    req.ip || "",
  ];

  const fingerprint = crypto
    .createHash("sha256")
    .update(components.join("|"))
    .digest("hex");

  return `server_${fingerprint.substring(0, 32)}`;
}
