const Footer = () => (
  <footer style={{ marginTop: 80, borderTop: "1px solid var(--line)", background: "var(--ivory-deep)" }}>
    <div className="container" style={{ padding: "48px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
      <div>
        <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>VIAURA</div>
        <p style={{ color: "var(--grey)", fontSize: 13, maxWidth: 280 }}>
          Men, women aur kids ke liye curated fragrances — Pakistan bhar mein Cash on Delivery ke sath.
        </p>
      </div>
      <div style={{ fontSize: 13, color: "var(--grey)" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Support</div>
        <div>Cash on Delivery available</div>
        <div>Delivery charge: Rs. 250 (all Pakistan)</div>
      </div>
    </div>
    <div style={{ borderTop: "1px solid var(--line)", padding: "16px 24px", textAlign: "center", fontSize: 12, color: "var(--grey)" }}>
      © {new Date().getFullYear()} Viaura. All rights reserved.
    </div>
  </footer>
);

export default Footer;
