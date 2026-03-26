import crypto from "crypto";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "chapa-secret-placeholder";
const CHAPA_API_URL = "https://api.chapa.co/v1/transaction/initialize";

export async function initializeChapaPayment({
  amount,
  currency,
  email,
  firstName,
  lastName,
  txRef,
  callbackUrl,
  returnUrl,
}: {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
  callbackUrl: string;
  returnUrl: string;
}) {
  try {
    const response = await fetch(CHAPA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: txRef,
        callback_url: callbackUrl,
        return_url: returnUrl,
        "customization[title]": "TTA Booking Payment",
        "customization[description]": `Payment for booking ${txRef}`,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chapa initialization error:", error);
    return { status: "error", message: "Connection failed" };
  }
}

export function verifyChapaWebhook(body: string, signature: string) {
  const hash = crypto
    .createHmac("sha256", CHAPA_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
