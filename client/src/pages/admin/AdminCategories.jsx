import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { getImageUrl } from "../../utils/imageUrl";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", group: "men", description: "" });
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/categories").then((res) => setCategories(res.data));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: "", group: "men", description: "" }); setImage(null); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);

      if (editingId) {
        await api.put(`/categories/${editingId}`, fd);
        toast.success("Category update ho gayi");
      } else {
        await api.post("/categories", fd);
        toast.success("Category add ho gayi (real-time home page pe dikhegi)");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save nahi hua");
    } finally {
      setSaving(false);
    }
  };

  const edit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, group: c.group, description: c.description || "" });
  };

  const remove = async (id) => {
    if (!confirm("Ye category delete karni hai?")) return;
    await api.delete(`/categories/${id}`);
    toast.info("Category delete ho gayi");
    load();
  };

  return (
    <div>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 20 }}>Categories</h1>

      <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 30, maxWidth: 480 }}>
        <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit Category" : "Add New Category"}</h3>
        <label className="field-label">Name</label>
        <input required className="input" style={{ marginBottom: 14 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label className="field-label">Group</label>
        <select className="input" style={{ marginBottom: 14 }} value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
          <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
        </select>

        <label className="field-label">Description (optional)</label>
        <input className="input" style={{ marginBottom: 14 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <label className="field-label">Card Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button disabled={saving} className="btn" type="submit">{saving ? "Saving..." : editingId ? "Update" : "Add Category"}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>}
        </div>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {categories.map((c) => (
          <div key={c._id} className="card" style={{ overflow: "hidden" }}>
            {c.image && <img src={getImageUrl(c.image)} style={{ width: "100%", height: 130, objectFit: "cover" }} />}
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--grey)", textTransform: "capitalize" }}>{c.group}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => edit(c)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 11 }}>Edit</button>
                <button onClick={() => remove(c._id)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 11 }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
