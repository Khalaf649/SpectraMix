import { Waves } from "lucide-react";
function Header() {
  return (
    <header>
      <div className="header-content">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Waves
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--primary-foreground)",
              }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Signal Processing Lab
            </h1>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--muted-foreground)",
                margin: 0,
              }}
            >
              Fourier Transform
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
