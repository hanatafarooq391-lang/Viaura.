import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { usePolling } from "../hooks/usePolling";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const load = async () => {
    const [catRes, prodRes] = await Promise.all([
      api.get("/categories"),
      api.get("/products?limit=8"),
    ]);
    setCategories(catRes.data);
    setProducts(prodRes.data.products);
  };

  useEffect(() => { load(); }, []);
  usePolling(load, 8000); // checks for new products/categories every 8 seconds

  return (
    <div>
      <section style={{ background: "var(--forest)", color: "var(--ivory)" }}>
        <div className="container" style={{ padding: "90px 24px", textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--gold-light)" }}>New Season Fragrances</div>
          <h1 className="display" style={{ fontSize: 48, color: "#fff", margin: "14px 0 20px" }}>
            Signature Scents for the Whole Family
          </h1>
          <p style={{ maxWidth: 480, margin: "0 auto 30px", color: "var(--ivory-deep)" }}>
            Curated perfumes for men, women, and kids — with Cash on Delivery across Pakistan.
          </p>
          <Link to="/shop/women" className="btn btn-gold">Shop the Collection</Link>
        </div>
      </section>

      <section className="container" style={{ padding: "64px 24px" }}>
        <h2 className="display" style={{ fontSize: 28, marginBottom: 24 }}>Shop by Category</h2>
        {categories.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>Categories will be added soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
            {categories.map((c) => <CategoryCard key={c._id} category={c} />)}
          </div>
        )}
      </section>

      <section className="container" style={{ padding: "0 24px 80px" }}>
        <h2 className="display" style={{ fontSize: 28, marginBottom: 24 }}>Latest Arrivals</h2>
        {products.length === 0 ? (
          <p style={{ color: "var(--grey)" }}>Products will be added soon.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;