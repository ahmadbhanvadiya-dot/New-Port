import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmad Bhanvadiya — Full-stack developer",
  description:
    "I build useful things with thoughtful engineering and a little cinematic chaos. Selected work by Ahmad Bhanvadiya.",
  metadataBase: new URL("https://portfolio-ahmadbhanvadiya.vercel.app"),
  openGraph: {
    title: "Ahmad Bhanvadiya — Full-stack developer",
    description: "Selected experiments, products, and digital experiences.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
