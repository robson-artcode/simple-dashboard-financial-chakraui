import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Dashboard Financeiro",
  description: "Gestão de ativos e visualização em gráfico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
