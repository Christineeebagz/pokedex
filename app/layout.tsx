import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokedex",
  description: "A simple catalogue webpage to view details of Pokemons",
  icons: { icon: "./pokeball.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={roboto.className}
        style={{
          backgroundImage: "url('/images/pokemon-bg.png')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
