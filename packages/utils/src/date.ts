import {
  formatDistanceToNow,
  differenceInHours,
  differenceInDays,
} from "date-fns";

export function formatDate(dateString: string | Date): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatExpiryDate(dateString: string | Date): string {
  const now = new Date();
  const date = new Date(dateString);
  const hours = differenceInHours(date, now);
  if (hours < 24) {
    return `Expires in ${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const days = differenceInDays(date, now);
  return `Expires in ${days} day${days !== 1 ? "s" : ""}`;
}
