import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <Link to={`/product/${product._id}`} className="card" style={{ overflow: "hidden", display: "block" }}>
      <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "var(--ivory-deep)" }}>
        <img src={getImageUrl(product.images?.[0])} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gold)", marginBottom: 4 }}>
          {product.category?.name}
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{product.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Rs. {(hasDiscount ? product.discountPrice : product.price).toLocaleString()}</span>
          {hasDiscount && (
            <span style={{ textDecoration: "line-through", color: "var(--grey)", fontSize: 13 }}>
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>
        {product.numReviews > 0 && (
          <div style={{ fontSize: 12, color: "var(--grey)", marginTop: 4 }}>
            ★ {product.ratingsAverage} ({product.numReviews} reviews)
          </div>
        )}
        {product.stock === 0 && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>Out of stock</div>}
      </div>
    </Link>
  );
};

export default ProductCard;
