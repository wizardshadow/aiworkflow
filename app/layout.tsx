import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI WORKFLOW — от идеи до результата",
  description: "Практический курс для дизайнеров. Встройте ИИ в рабочий процесс: от брифа и концепции до готового продукта.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
