import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { usePolling } from "../../hooks/usePolling";
import { toast } from "react-toastify";

const StatCard = ({ label, value, accent }) => (
  <div className="card" style={{ padding: 22 }}>
    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--grey)", marginBottom: 8 }}>{label}</div>
    <div className="display" style={{ fontSize: 28, color: accent || "var(--charcoal)" }}>{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const prevOrderCount = useRef(null);

  const load = () =>
    api.get("/admin/stats")
      .then((res) => {
        // Naye order ko detect karne ke liye pichli baar ke total se compare karta hai
        if (prevOrderCount.current !== null && res.data.totalOrders > prevOrderCount.current) {
          toast.success("🛍️ Naya order aya!", { autoClose: 6000 });
        }
        prevOrderCount.current = res.data.totalOrders;
        setStats(res.data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Stats load nahi ho sake — server chal raha hai check karein"));

  useEffect(() => { load(); }, []);
  usePolling(load, 8000); // naye orders/status updates har 8 second mein check karta hai

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 30 }}>
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} accent="#8A6116" />
        <StatCard label="Delivered/Completed" value={stats.deliveredOrders} accent="var(--success)" />
        <StatCard label="Returned" value={stats.returnedOrders} accent="var(--danger)" />
        <StatCard label="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} accent="var(--forest)" />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Repeat Customers" value={stats.repeatCustomers} accent="var(--gold)" />
      </div>
      <p style={{ color: "var(--grey)", fontSize: 13 }}>
        Naya order aane par yahan (kuch second ke andar) notification aayegi aur "Orders" tab mein WhatsApp link milega.
      </p>
    </div>
  );
};

export default AdminDashboard;
