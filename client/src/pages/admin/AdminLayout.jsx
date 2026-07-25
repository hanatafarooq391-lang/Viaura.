import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/customers", label: "Customers" },
];

const AdminLayout = () => (
  <div className="admin-shell" style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 200px)" }}>
    <aside className="admin-sidebar" style={{ borderRight: "1px solid var(--line)", padding: "30px 0" }}>
      <div className="display" style={{ fontSize: 20, padding: "0 24px", marginBottom: 24 }}>Admin Panel</div>
      <nav style={{ display: "flex", flexDirection: "column" }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            style={({ isActive }) => ({
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: isActive ? "var(--forest)" : "var(--charcoal)",
              background: isActive ? "var(--ivory-deep)" : "transparent",
              borderLeft: isActive ? "3px solid var(--forest)" : "3px solid transparent",
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="container" style={{ padding: "30px 24px" }}>
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
