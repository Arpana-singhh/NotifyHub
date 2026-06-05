import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "6rem", fontWeight: "bold", margin: 0 }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Page Not Found</h2>
      <p style={{ color: "#666" }}>The page you're looking for doesn't exist.</p>
      <Link href="/" style={{ padding: "0.5rem 1.5rem", background: "var(--color-primary)", color: "#fff", borderRadius: "6px", textDecoration: "none" }}>
        Go Home
      </Link>
    </div>
  );
}
