import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => { api.get("/admin/customers").then((res) => setCustomers(res.data)); }, []);

  return (
    <div>
      <h1 className="display" style={{ fontSize: 26, marginBottom: 20 }}>Customers</h1>
      <p style={{ color: "var(--grey)", fontSize: 13, marginBottom: 16 }}>
        Guest checkout hone ki wajah se customers phone number se identify hote hain (koi account nahi banta).
      </p>
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 640 }}>
          <thead>
            <tr style={{ background: "var(--ivory-deep)", textAlign: "left" }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Phone</th>
              <th style={{ padding: 12 }}>City</th>
              <th style={{ padding: 12 }}>Total Orders</th>
              <th style={{ padding: 12 }}>Total Spent</th>
              <th style={{ padding: 12 }}>Type</th>
              <th style={{ padding: 12 }}>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.phone} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: 12 }}>{c.name}</td>
                <td style={{ padding: 12 }}>{c.phone}</td>
                <td style={{ padding: 12 }}>{c.city || "-"}</td>
                <td style={{ padding: 12 }}>{c.totalOrders}</td>
                <td style={{ padding: 12 }}>Rs. {c.totalSpent.toLocaleString()}</td>
                <td style={{ padding: 12 }}>
                  {c.isRepeatCustomer ? <span className="badge badge-completed">Repeat</span> : <span className="badge badge-processing">New</span>}
                </td>
                <td style={{ padding: 12 }}>{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
