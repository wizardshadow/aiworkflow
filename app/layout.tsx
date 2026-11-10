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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html[data-preload=on],html:not([data-preload]) body:has(.site-preloader:not(.is-leaving)){overflow:hidden}.site-preloader{position:fixed;inset:0;z-index:999998;background:#000;color:#ff5b0b}",
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
