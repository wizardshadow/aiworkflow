import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Благодарю! — AI WORKFLOW",
  description:
    "Оплата прошла успешно. Инструкции отправлены на почту. Старт курса — 1 декабря.",
};

export default function SuccessLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
