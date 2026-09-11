import { headers } from "next/headers";

import { StyledComponentsRegistry } from "@/styles/styled-components-registry";

import { Providers } from "./providers";

const description =
  "Construction resource and inventory management for the Sita Shelters project portfolio.";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: origin,
    icons: {
      icon: [
        { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/icons/apple-touch-icon.png",
    },
    title: {
      default: "Sita Shelters",
      template: "%s · Sita Shelters",
    },
    description,
    applicationName: "Sita Shelters",
    openGraph: {
      type: "website",
      url: origin,
      siteName: "Sita Shelters",
      title: "Sita Shelters",
      description,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Sita Shelters construction resource and inventory management",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Sita Shelters",
      description,
      images: [socialImage],
    },
  };
}

export const viewport = {
  colorScheme: "light",
  themeColor: "#fcf6f5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
