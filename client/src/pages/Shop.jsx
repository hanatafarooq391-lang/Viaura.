import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { usePolling } from "../hooks/usePolling";

const Shop = () => {
  const { group } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [catRes, prodRes] = await Promise.all([
      api.get(`/categories?group=${group}`),
      api.get(`/products?group=${group}${categoryId ? `&category=${categoryId}` : ""}${search ? `&search=${search}` : ""}&page=${page}`),
    ]);
    setCategories(catRes.data);
    setProducts(prodRes.data.products);
    setPages(prodRes.data.pages);
    setLoading(false);
  };

  useEffect(() => { setPage(1); }, [group, categoryId]);
  useEffect(() => { load(); }, [group, categoryId, page]);
  usePolling(load, 8000); // naye products har 8 second mein check karta hai

  return (
    <div className="container" style={{ padding: "40px 24px 80px" }}>
      <h1 className="display" style={{ fontSize: 32, textTransform: "capitalize", marginBottom: 6 }}>{group}'s Collection</h1>
      <p style={{ color: "var(--grey)", marginBottom: 30 }}>Latest {group} fragrances, delivered across Pakistan.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
        <button className={`btn ${!categoryId ? "" : "btn-outline"}`} style={{ padding: "8px 16px" }} onClick={() => setSearchParams({})}>All</button>
        {categories.map((c) => (
          <button
            key={c._id}
            className={`btn ${categoryId === c._id ? "" : "btn-outline"}`}
            style={{ padding: "8px 16px" }}
            onClick={() => setSearchParams({ category: c._id })}
          >
            {c.name}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ marginLeft: "auto" }}>
          <input className="input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p style={{ color: "var(--grey)" }}>Is category mein abhi koi product nahi hai.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`btn ${p === page ? "" : "btn-outline"}`} style={{ padding: "8px 14px" }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
