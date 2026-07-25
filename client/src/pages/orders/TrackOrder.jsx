import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";

const statusLabel = { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", completed: "Completed", returned: "Returned", cancelled: "Cancelled" };

const TrackOrder = () => {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/orders/lookup", { phone });
      setOrders(data);
      if (data.length === 0) toast.info("Is number se koi order nahi mila");
    } catch (err) {
      toast.error("Kuch masla ho gaya, dobara try karein");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: 640 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>Track Your Order</h1>
      <p style={{ color: "var(--grey)", marginBottom: 24 }}>Apna phone number dein jo order karte waqt diya tha.</p>

      <form onSubmit={lookup} className="card" style={{ padding: 20, display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        <input required className="input" placeholder="03XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <button disabled={loading} className="btn" type="submit">{loading ? "Searching..." : "Track"}</button>
      </form>

      {orders && orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => (
            <Link to={`/order/${o._id}`} key={o._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>Order #{o._id.slice(-8).toUpperCase()}</div>
                <div style={{ fontSize: 13, color: "var(--grey)" }}>{new Date(o.createdAt).toLocaleDateString()} · {o.orderItems.length} item(s)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className={`badge badge-${o.status}`}>{statusLabel[o.status]}</div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>Rs. {o.totalPrice.toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
