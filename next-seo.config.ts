import { type DefaultSeoProps } from "next-seo";

const title = "Discord Token Checker";
const description =
  "A fast, web-based Discord token checker. Find verified, unverified and nitro accounts easily.";

const config: DefaultSeoProps = {
  title,
  description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://discord-checker.janic.dev/",
    siteName: title,
    title: "Check your Discord Tokens easily",
    description,
    images: [
      {
        url: "https://discord-checker.janic.dev/og.png",
        width: 1200,
        height: 630,
        alt: title,
        type: "image/png",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
  themeColor: "#5865F2",
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
  ],
  additionalLinkTags: [{ rel: "icon", href: "/favicon.ico" }],
};

export default config;
