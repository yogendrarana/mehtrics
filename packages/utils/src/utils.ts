import {
  formatDistanceToNow,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function getDeviceName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android"))
    return ua.includes("mobile") ? "Android Phone" : "Android Tablet";
  if (ua.includes("windows")) return "Windows PC";
  if (ua.includes("mac os")) return "Mac";
  if (ua.includes("linux")) return "Linux PC";
  return "Unknown Device";
}

export function getBrowserName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Unknown Browser";
}

export function generateRandomId(length = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
