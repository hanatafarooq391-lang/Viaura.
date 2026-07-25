import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "70px 24px", maxWidth: 420 }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>Admin Login</h1>
      <p style={{ color: "var(--grey)", marginBottom: 24, fontSize: 14 }}>Sirf store admin ke liye. Customers ko login ki zaroorat nahi.</p>
      <form onSubmit={submit} className="card" style={{ padding: 24 }}>
        <label className="field-label">Email</label>
        <input required type="email" className="input" style={{ marginBottom: 14 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="field-label">Password</label>
        <input required type="password" className="input" style={{ marginBottom: 20 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="btn" style={{ width: "100%" }}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
};

export default AdminLogin;
