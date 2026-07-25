import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { usePolling } from "../../hooks/usePolling";
import { toast } from "react-toastify";

const steps = ["pending", "processing", "shipped", "delivered", "completed"];
const statusLabel = { pending: "Order Placed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", completed: "Completed", returned: "Returned", cancelled: "Cancelled" };

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const prevStatus = useRef(null);

  const load = () =>
    api.get(`/orders/${id}`).then((res) => {
      if (prevStatus.current && prevStatus.current !== res.data.status) {
        toast.info(`Order status update: ${statusLabel[res.data.status]}`);
      }
      prevStatus.current = res.data.status;
      setOrder(res.data);
    });

  useEffect(() => { load(); }, [id]);
  usePolling(load, 6000); // status update har 6 second mein check karta hai

  if (!order) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  const isReturnedOrCancelled = ["returned", "cancelled"].includes(order.status);
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="container" style={{ padding: "40px 24px 80px", maxWidth: 720 }}>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 6 }}>Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p style={{ color: "var(--grey)", marginBottom: 30 }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>

      {isReturnedOrCancelled ? (
        <div className={`badge badge-${order.status}`} style={{ fontSize: 14, padding: "8px 16px", marginBottom: 30 }}>
          {statusLabel[order.status]}
        </div>
      ) : (
        <div style={{ display: "flex", marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", margin: "0 auto 8px",
                background: i <= currentStepIndex ? "var(--forest)" : "var(--line)",
                color: i <= currentStepIndex ? "#fff" : "var(--grey)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700
              }}>{i + 1}</div>
              <div style={{ fontSize: 12, color: i <= currentStepIndex ? "var(--forest)" : "var(--grey)", fontWeight: i === currentStepIndex ? 700 : 400 }}>
                {statusLabel[s]}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Items</h3>
        {order.orderItems.map((i, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
            <span>{i.name} {i.size && `(${i.size})`} x{i.qty}</span>
            <span>Rs. {(i.price * i.qty).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Delivery Charge</span><span>Rs. {order.deliveryCharge}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, paddingTop: 8, borderTop: "1px solid var(--line)" }}><span>Total</span><span>Rs. {order.totalPrice.toLocaleString()}</span></div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Shipping Address</h3>
        <p style={{ margin: 0 }}>{order.shippingAddress.fullName}</p>
        <p style={{ margin: 0, color: "var(--grey)" }}>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
        <p style={{ margin: 0, color: "var(--grey)" }}>{order.shippingAddress.phone}</p>
        <p style={{ marginTop: 8, fontWeight: 600 }}>Payment: Cash on Delivery</p>
      </div>
    </div>
  );
};

export default OrderTracking;
