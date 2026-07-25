import { supabase } from "../config/supabase.js";

// @route GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  const [totalOrdersRes, pendingOrdersRes, totalProductsRes, returnedOrdersRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "returned"),
  ]);

  const { data: deliveredOrdersData } = await supabase
    .from("orders")
    .select("total_price")
    .in("status", ["delivered", "completed"]);

  const deliveredOrders = deliveredOrdersData?.length || 0;
  const totalRevenue = (deliveredOrdersData || []).reduce((sum, o) => sum + Number(o.total_price), 0);

  const { data: allOrders } = await supabase.from("orders").select("shipping_address");
  const phoneCounts = {};
  (allOrders || []).forEach((o) => {
    const phone = o.shipping_address?.phone;
    if (phone) phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
  });
  const totalCustomers = Object.keys(phoneCounts).length;
  const repeatCustomers = Object.values(phoneCounts).filter((c) => c >= 2).length;

  res.json({
    totalOrders: totalOrdersRes.count || 0,
    pendingOrders: pendingOrdersRes.count || 0,
    deliveredOrders,
    returnedOrders: returnedOrdersRes.count || 0,
    totalProducts: totalProductsRes.count || 0,
    totalCustomers,
    repeatCustomers,
    totalRevenue,
  });
};

// @route GET /api/admin/customers — customer list grouped by phone, with repeat flag
export const getCustomers = async (req, res) => {
  const { data: orders } = await supabase
    .from("orders")
    .select("shipping_address, total_price, created_at")
    .order("created_at", { ascending: true });

  const map = {};
  (orders || []).forEach((o) => {
    const phone = o.shipping_address?.phone;
    if (!phone) return;
    if (!map[phone]) {
      map[phone] = {
        phone,
        name: o.shipping_address.fullName,
        email: o.shipping_address.email || "",
        city: o.shipping_address.city,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: o.created_at,
      };
    }
    map[phone].totalOrders += 1;
    map[phone].totalSpent += Number(o.total_price);
    map[phone].name = o.shipping_address.fullName;
    map[phone].lastOrderAt = o.created_at;
  });

  const customers = Object.values(map)
    .map((c) => ({ ...c, isRepeatCustomer: c.totalOrders >= 2 }))
    .sort((a, b) => b.totalOrders - a.totalOrders);

  res.json(customers);
};
