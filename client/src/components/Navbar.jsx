import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const groups = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
];

const Navbar = () => {
  const { items } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--ivory)", position: "sticky", top: 0, zIndex: 40 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px" }}>
        <Link to="/" className="display" style={{ fontSize: 24, letterSpacing: "0.03em" }}>
          VIAURA
        </Link>

        <nav className="nav-links" style={{ display: "flex", gap: 28 }}>
          {groups.map((g) => (
            <Link key={g.value} to={`/shop/${g.value}`} style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              {g.label}
            </Link>
          ))}
          <Link to="/track-order" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Track Order
          </Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/cart" style={{ position: "relative", fontSize: 13, fontWeight: 600, textTransform: "uppercase" }}>
            Cart{cartCount > 0 && <span style={{ marginLeft: 6, background: "var(--forest)", color: "var(--ivory)", borderRadius: "50%", padding: "2px 7px", fontSize: 11 }}>{cartCount}</span>}
          </Link>
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            style={{ display: "none", background: "none", border: "none", fontSize: 22, padding: 4 }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" style={{ borderTop: "1px solid var(--line)", padding: "14px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {groups.map((g) => (
            <Link key={g.value} to={`/shop/${g.value}`} onClick={() => setMobileOpen(false)} style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase" }}>
              {g.label}
            </Link>
          ))}
          <Link to="/track-order" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase" }}>
            Track Order
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
