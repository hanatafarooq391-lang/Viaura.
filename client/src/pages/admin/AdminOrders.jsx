import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { usePolling } from "../../hooks/usePolling";
import { toast } from "react-toastify";
import { buildAdminOrderWhatsAppLink, buildCustomerWhatsAppLink } from "../../utils/whatsapp";

const statusOptions = ["pending", "processing", "shipped", "delivered", "completed", "returned", "cancelled"];
const statusLabel = { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", completed: "Completed", returned: "Returned", cancelled: "Cancelled" };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const knownIds = useRef(new Set());
  const firstLoad = useRef(true);

  const load = () =>
    api.get(`/orders${filter ? `?status=${filter}` : ""}`).then((res) => {
      const newOrders = res.data;

      // Naye orders detect karta hai (jo pehle nahi dekhe the) aur toast dikhata hai
      if (!firstLoad.current) {
        const fresh = newOrders.filter((o) => !knownIds.current.has(o._id));
        fresh.forEach((o) => {
          toast.success(
            `🛍️ Naya order! ${o.shippingAddress?.fullName || ""} ${o.isRepeatCustomerOrder ? "(Repeat Customer 🔁)" : "(New Customer)"} — Rs. ${o.totalPrice}`,
            { autoClose: 8000 }
          );
        });
      }
      firstLoad.current = false;
      knownIds.current = new Set(newOrders.map((o) => o._id));

      setOrders(newOrders);
    });

  useEffect(() => { firstLoad.current = true; load(); }, [filter]);
  usePolling(load, 6000); // naye orders/status updates har 6 second mein check karta hai

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Status update ho gaya: ${statusLabel[status]}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update nahi hua");
    }
  };

  return (
    <div>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 20 }}>Orders</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button className={`btn ${!filter ? "" : "btn-outline"}`} style={{ padding: "7px 14px" }} onClick={() => setFilter("")}>All</button>
        {statusOptions.map((s) => (
          <button key={s} className={`btn ${filter === s ? "" : "btn-outline"}`} style={{ padding: "7px 14px" }} onClick={() => setFilter(s)}>
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>Koi order nahi mila.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.map((o) => (
            <div key={o._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    #{o._id.slice(-8).toUpperCase()} — {o.shippingAddress?.fullName}
                    {o.isRepeatCustomerOrder && <span className="badge badge-completed" style={{ marginLeft: 8 }}>Repeat Customer</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--grey)" }}>{o.shippingAddress?.phone} · {o.shippingAddress?.city}</div>
                  {o.shippingAddress?.email && <div style={{ fontSize: 13, color: "var(--grey)" }}>{o.shippingAddress.email}</div>}
                  <div style={{ fontSize: 13, color: "var(--grey)" }}>{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={`badge badge-${o.status}`}>{statusLabel[o.status]}</div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>Rs. {o.totalPrice.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: "var(--grey)", marginBottom: 12 }}>
                {o.orderItems.map((i) => `${i.name} (${i.size || "N/A"}) x${i.qty}`).join(", ")}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select className="input" style={{ width: 160 }} value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>

                <a href={buildAdminOrderWhatsAppLink(o)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: "8px 16px" }}>
                  Notify Admin (Self)
                </a>
                <a href={buildCustomerWhatsAppLink(o)} target="_blank" rel="noreferrer" className="btn btn-gold" style={{ padding: "8px 16px" }}>
                  Message Customer on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
