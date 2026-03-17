export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatPrice(amount: number): string {
  return `$${amount}`;
}

export function getPaymentLabel(type: string): string {
  switch (type) {
    case "PAY_ONLINE": return "PAY ONLINE";
    case "PAY_ONSITE": return "PAY ONSITE";
    case "WALK_IN_ONLY": return "WALK-IN ONLY";
    case "PAY_ONLINE_OR_ONSITE": return "PAY ONLINE · PAY ONSITE";
    default: return type;
  }
}

export function getPaymentColor(type: string): string {
  switch (type) {
    case "PAY_ONLINE": return "text-amber-700";
    case "PAY_ONSITE": return "text-amber-700";
    case "WALK_IN_ONLY": return "text-gray-500";
    case "PAY_ONLINE_OR_ONSITE": return "text-amber-700";
    default: return "text-gray-500";
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
