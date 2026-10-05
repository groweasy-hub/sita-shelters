/** Turns a raw User-Agent header into "Chrome on macOS" plus a mobile/desktop hint for the UI icon. */
export function describeDevice(userAgent) {
  if (!userAgent) {
    return { label: "Unknown device", type: "desktop" };
  }

  let os = null;
  if (/iPhone/i.test(userAgent)) os = "iPhone";
  else if (/iPad/i.test(userAgent)) os = "iPad";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(userAgent)) os = "macOS";
  else if (/CrOS/i.test(userAgent)) os = "ChromeOS";
  else if (/Linux/i.test(userAgent)) os = "Linux";

  // Order matters: Edge/Opera UAs also contain "Chrome", Chrome's contains "Safari".
  let browser = null;
  if (/Edg(e|A|iOS)?\//i.test(userAgent)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(userAgent)) browser = "Opera";
  else if (/Firefox|FxiOS/i.test(userAgent)) browser = "Firefox";
  else if (/Chrome|CriOS/i.test(userAgent)) browser = "Chrome";
  else if (/Safari/i.test(userAgent)) browser = "Safari";
  else if (/curl|node|undici|axios/i.test(userAgent)) browser = "API client";

  const label =
    browser && os ? `${browser} on ${os}` : (browser ?? os ?? "Unknown device");
  return {
    label,
    type: os === "iPhone" || os === "Android" ? "mobile" : "desktop",
  };
}

/** Partially masks an address for display: 203.192.*.* / 2401:4900:*:*. */
export function maskIpAddress(ipAddress) {
  if (!ipAddress) {
    return null;
  }
  const ip = ipAddress.replace(/^::ffff:/, "");
  if (ip === "::1" || ip === "127.0.0.1") {
    return "Localhost";
  }
  if (ip.includes(".")) {
    const [first, second] = ip.split(".");
    return `${first}.${second}.*.*`;
  }
  const [first, second] = ip.split(":");
  return `${first}:${second}:*:*`;
}
