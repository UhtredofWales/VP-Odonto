import LogoTab from "../../components/LogoTab";

export const metadata = { title: "Logo nas imagens" };

export default function Page() {
  return (
    <main>
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 0" }}>
        <a href="/" style={{ color: "#0e2240", fontSize: ".9rem" }}>
          Voltar para a Central de Posts
        </a>
      </nav>
      <LogoTab />
    </main>
  );
}