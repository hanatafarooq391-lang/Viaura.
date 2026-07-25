import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUrl";

const Cart = () => {
  const { items, updateQty, removeFromCart, itemsPrice, deliveryCharge, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2 className="display" style={{ marginBottom: 12 }}>Aapka cart khali hai</h2>
        <Link to="/" className="btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-grid" style={{ padding: "40px 24px 80px" }}>
      <div>
        <h1 className="display" style={{ fontSize: 28, marginBottom: 24 }}>Shopping Cart</h1>
        {items.map((i) => (
          <div key={`${i.product}-${i.size}-${i.color}`} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
            <img src={getImageUrl(i.image)} style={{ width: 80, height: 100, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{i.name}</div>
              <div style={{ fontSize: 13, color: "var(--grey)" }}>{i.size && `Size: ${i.size}`} {i.color && `· Color: ${i.color}`}</div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="number" min="1" max={i.stock} value={i.qty}
                  onChange={(e) => updateQty(i.product, i.size, i.color, Number(e.target.value))}
                  className="input" style={{ width: 70 }}
                />
                <button onClick={() => removeFromCart(i.product, i.size, i.color)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 13 }}>Remove</button>
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>Rs. {(i.price * i.qty).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24, height: "fit-content" }}>
        <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span>Subtotal</span><span>Rs. {itemsPrice.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 14 }}>
          <span>Delivery Charge</span><span>Rs. {deliveryCharge.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 20 }}>
          <span>Total</span><span>Rs. {totalPrice.toLocaleString()}</span>
        </div>
        <button className="btn" style={{ width: "100%" }} onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
        <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 10, textAlign: "center" }}>Cash on Delivery available</div>
      </div>
    </div>
  );
};

export default Cart;
