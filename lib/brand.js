// All client-facing branding is configuration, so the same app can be
// white-labelled per clinic. Values below are fictional defaults.
export const BRAND = {
  clinicName: process.env.NEXT_PUBLIC_CLINIC_NAME || "Lumen Aesthetics",
  logo: process.env.NEXT_PUBLIC_LOGO_URL || "",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "https://example.com/book",
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || "https://example.com/privacy",
};
