export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}
