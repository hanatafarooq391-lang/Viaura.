import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

const CategoryCard = ({ category }) => (
  <Link
    to={`/shop/${category.group}?category=${category._id}`}
    style={{ position: "relative", display: "block", aspectRatio: "4/5", overflow: "hidden", borderRadius: "var(--radius)" }}
  >
    <img
      src={category.image ? getImageUrl(category.image) : "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600"}
      alt={category.name}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(31,58,52,0.75) 100%)" }} />
    <div style={{ position: "absolute", bottom: 20, left: 20, color: "#fff" }}>
      <div className="eyebrow" style={{ color: "var(--gold-light)" }}>{category.group}</div>
      <div className="display" style={{ fontSize: 22, color: "#fff" }}>{category.name}</div>
    </div>
  </Link>
);

export default CategoryCard;
