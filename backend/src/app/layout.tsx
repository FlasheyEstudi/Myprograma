import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Reservation API",
  description: "Backend API for restaurant reservation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
