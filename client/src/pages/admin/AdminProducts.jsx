import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/imageUrl";

const emptyForm = { name: "", description: "", group: "men", category: "", price: "", discountPrice: "", stock: "", sizes: "", colors: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => api.get("/products?limit=100").then((res) => setProducts(res.data.products));
  const loadCategories = () => api.get(`/categories?group=${form.group}`).then((res) => setCategories(res.data));

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { loadCategories(); }, [form.group]);

  const resetForm = () => { setForm(emptyForm); setImages([]); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img));

      if (editingId) {
        await api.put(`/products/${editingId}`, fd);
        toast.success("Product update ho gaya");
      } else {
        await api.post("/products", fd);
        toast.success("Product add ho gaya (real-time customers ko dikhega)");
      }
      resetForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save nahi hua");
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description, group: p.group, category: p.category?._id || "",
      price: p.price, discountPrice: p.discountPrice || "", stock: p.stock,
      sizes: p.sizes.join(", "), colors: p.colors.join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Ye product delete karna hai?")) return;
    await api.delete(`/products/${id}`);
    toast.info("Product delete ho gaya");
    loadProducts();
  };

  return (
    <div>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 20 }}>Products</h1>

      <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit Product" : "Add New Product"}</h3>
        <div className="form-grid-2">
          <div>
            <label className="field-label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Group</label>
            <select className="input" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value, category: "" })}>
              <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
            </select>
          </div>
          <div>
            <label className="field-label">Category</label>
            <select required className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Stock</label>
            <input required type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Price (Rs.)</label>
            <input required type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Discount Price (optional)</label>
            <input type="number" min="0" className="input" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Sizes / Volumes (comma separated)</label>
            <input className="input" placeholder="30ml, 50ml, 100ml" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Colors (comma separated)</label>
            <input className="input" placeholder="Black, White, Blue" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="field-label">Description</label>
          <textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="field-label">Images {editingId && "(khali chodein agar change nahi karni)"}</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button disabled={saving} className="btn" type="submit">{saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>}
        </div>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <div key={p._id} className="card" style={{ overflow: "hidden" }}>
            <img src={getImageUrl(p.images[0])} style={{ width: "100%", height: 160, objectFit: "cover" }} />
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "var(--grey)" }}>Rs. {p.price} · Stock: {p.stock}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => edit(p)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 11 }}>Edit</button>
                <button onClick={() => remove(p._id)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 11 }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
