import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const Checkout = () => {
  const { items, itemsPrice, deliveryCharge, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", address: "", city: "" });

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ product: i.product, name: i.name, qty: i.qty, size: i.size, color: i.color }));
      const { data } = await api.post("/orders", { orderItems, shippingAddress: form });
      clearCart();
      toast.success("Order successfully place ho gaya!");
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order place nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-grid" style={{ padding: "40px 24px 80px" }}>
      <div>
        <h1 className="display" style={{ fontSize: 28, marginBottom: 24 }}>Checkout</h1>
        <form onSubmit={placeOrder} className="card" style={{ padding: 24 }}>
          <label className="field-label">Full Name</label>
          <input required className="input" style={{ marginBottom: 14 }} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

          <label className="field-label">Phone Number</label>
          <input required className="input" style={{ marginBottom: 14 }} placeholder="03XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label className="field-label">Email (order confirmation ke liye, optional)</label>
          <input type="email" className="input" style={{ marginBottom: 14 }} placeholder="aap@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="field-label">Address</label>
          <textarea required rows={3} className="input" style={{ marginBottom: 14 }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

          <label className="field-label">City</label>
          <input required className="input" style={{ marginBottom: 20 }} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

          <div className="card" style={{ padding: 14, marginBottom: 20, background: "var(--ivory-deep)" }}>
            <strong>Payment Method:</strong> Cash on Delivery (COD)
          </div>

          <button disabled={loading} className="btn" style={{ width: "100%" }} type="submit">
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, height: "fit-content" }}>
        <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
        {items.map((i) => (
          <div key={`${i.product}-${i.size}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span>{i.name} x{i.qty}</span><span>Rs. {(i.price * i.qty).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>Subtotal</span><span>Rs. {itemsPrice.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>Delivery</span><span>Rs. {deliveryCharge.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}><span>Total</span><span>Rs. {totalPrice.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
