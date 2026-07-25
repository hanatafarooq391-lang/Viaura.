import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { usePolling } from "../hooks/usePolling";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/imageUrl";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const load = async () => {
    const [pRes, rRes] = await Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`),
    ]);
    setProduct(pRes.data);
    setReviews(rRes.data);
    setSize(pRes.data.sizes?.[0] || "");
    setColor(pRes.data.colors?.[0] || "");
  };

  useEffect(() => { load(); }, [id]);

  // Naye reviews har 8 second mein check karta hai - product ka size/color selection disturb nahi karta
  usePolling(async () => {
    const rRes = await api.get(`/products/${id}/reviews`);
    setReviews(rRes.data);
    const pRes = await api.get(`/products/${id}`);
    setProduct((prev) => (prev ? { ...prev, numReviews: pRes.data.numReviews, ratingsAverage: pRes.data.ratingsAverage, stock: pRes.data.stock } : prev));
  }, 8000);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return toast.info("Apna naam likhein");
    try {
      await api.post(`/products/${id}/reviews`, { name: reviewerName, rating, comment });
      setComment("");
      toast.success("Review submit ho gaya!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Review submit nahi hua");
    }
  };

  if (!product) return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <div className="pd-grid">
        <div>
          <div style={{ aspectRatio: "3/4", background: "var(--ivory-deep)", overflow: "hidden", marginBottom: 10 }}>
            <img src={getImageUrl(product.images[activeImg])} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ border: activeImg === i ? "2px solid var(--forest)" : "1px solid var(--line)", padding: 0, width: 64, height: 80, background: "none" }}>
                <img src={getImageUrl(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow">{product.category?.name}</div>
          <h1 className="display" style={{ fontSize: 30, margin: "8px 0" }}>{product.name}</h1>
          {product.numReviews > 0 && (
            <div style={{ color: "var(--grey)", marginBottom: 12 }}>★ {product.ratingsAverage} ({product.numReviews} reviews)</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>Rs. {(hasDiscount ? product.discountPrice : product.price).toLocaleString()}</span>
            {hasDiscount && <span style={{ textDecoration: "line-through", color: "var(--grey)" }}>Rs. {product.price.toLocaleString()}</span>}
          </div>

          <p style={{ color: "var(--grey)", lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Size / Volume</label>
              <div style={{ display: "flex", gap: 8 }}>
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`btn ${size === s ? "" : "btn-outline"}`} style={{ padding: "8px 16px" }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`btn ${color === c ? "" : "btn-outline"}`} style={{ padding: "8px 16px" }}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label className="field-label">Quantity</label>
            <input type="number" min="1" max={product.stock} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input" style={{ width: 90 }} />
            <span style={{ marginLeft: 12, fontSize: 13, color: "var(--grey)" }}>{product.stock} in stock</span>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={() => addToCart(product, qty, size, color)}
            className="btn"
            style={{ width: "100%", padding: "16px" }}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 70, maxWidth: 700 }}>
        <h2 className="display" style={{ fontSize: 24, marginBottom: 20 }}>Customer Reviews</h2>

        <form onSubmit={submitReview} className="card" style={{ padding: 20, marginBottom: 30 }}>
            <label className="field-label">Your Name</label>
            <input className="input" required value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} style={{ marginBottom: 12 }} />
            <label className="field-label">Your Rating</label>
            <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: 100, marginBottom: 12 }}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
            </select>
            <label className="field-label">Comment</label>
            <textarea className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} required style={{ marginBottom: 12 }} />
            <button className="btn" type="submit">Submit Review</button>
          </form>

        {reviews.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>Abhi koi review nahi hai. Pehla review aap dein!</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} style={{ borderBottom: "1px solid var(--line)", padding: "16px 0" }}>
              <div style={{ fontWeight: 600 }}>{r.name} <span style={{ color: "var(--gold)", fontWeight: 400 }}>{"★".repeat(r.rating)}</span></div>
              <p style={{ color: "var(--grey)", margin: "4px 0 0" }}>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
