import "./globals.css";

export const metadata = {
  title: "Central de Posts · Odontologia",
  description: "Gerador e pré-visualizador de posts odontológicos em alta definição",
  icons: {
    icon: "/logo-gold.png",
    shortcut: "/logo-gold.png",
    apple: "/logo-gold.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/logo-gold.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}