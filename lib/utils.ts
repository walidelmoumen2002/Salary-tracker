
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}

export function getErrorMessage(error: any): string {
  const message = error?.message || error?.error_description || "An unexpected error occurred";
  if (message === "Failed to fetch") {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  return message;
}
