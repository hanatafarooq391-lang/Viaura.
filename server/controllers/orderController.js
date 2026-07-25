import { supabase } from "../config/supabase.js";
import { buildAdminOrderWhatsAppLink } from "../utils/whatsapp.js";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendOrderStatusEmail } from "../utils/email.js";

const DELIVERY_CHARGE = Number(process.env.DELIVERY_CHARGE || 250);
const FREE_DELIVERY_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD || 0);

const ORDER_SELECT =
  "_id:id, orderItems:order_items, shippingAddress:shipping_address, paymentMethod:payment_method, itemsPrice:items_price, deliveryCharge:delivery_charge, totalPrice:total_price, status, statusHistory:status_history, isRepeatCustomerOrder:is_repeat_customer_order, createdAt:created_at";

// @route POST /api/orders (guest checkout - no login required, COD only)
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Cart khali hai" });
    }
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city) {
      return res.status(400).json({ message: "Shipping address ki sari details bharein" });
    }

    let itemsPrice = 0;
    const verifiedItems = [];

    for (const item of orderItems) {
      const { data: product } = await supabase.from("products").select("*").eq("id", item.product).single();
      if (!product) return res.status(404).json({ message: `Product nahi mila: ${item.name}` });
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `${product.name} stock mein nahi hai (sirf ${product.stock} bache hain)` });
      }
      const price = product.discount_price > 0 ? product.discount_price : product.price;
      itemsPrice += price * item.qty;

      verifiedItems.push({
        product: product.id,
        name: product.name,
        image: product.images[0],
        price,
        size: item.size || "",
        color: item.color || "",
        qty: item.qty,
      });

      await supabase.from("products").update({ stock: product.stock - item.qty }).eq("id", product.id);
    }

    const deliveryCharge =
      FREE_DELIVERY_THRESHOLD > 0 && itemsPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalPrice = itemsPrice + deliveryCharge;

    const cleanPhone = shippingAddress.phone.replace(/\s+/g, "");
    const { count: previousOrdersCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("shipping_address->>phone", cleanPhone);
    const isRepeatCustomerOrder = (previousOrdersCount || 0) > 0;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_items: verifiedItems,
        shipping_address: { ...shippingAddress, phone: cleanPhone },
        payment_method: "COD",
        items_price: itemsPrice,
        delivery_charge: deliveryCharge,
        total_price: totalPrice,
        status: "pending",
        status_history: [{ status: "pending", note: "Order place hua", at: new Date().toISOString() }],
        is_repeat_customer_order: isRepeatCustomerOrder,
      })
      .select(ORDER_SELECT)
      .single();

    if (error) return res.status(500).json({ message: error.message });

    const whatsappLink = buildAdminOrderWhatsAppLink(order, shippingAddress.fullName);

    sendOrderConfirmationEmail(order, shippingAddress.email);
    sendAdminNewOrderEmail(order);

    res.status(201).json({ order, whatsappLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/orders/lookup { phone } — guest order history, no login needed
export const lookupOrdersByPhone = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number dein" });
  const cleanPhone = phone.replace(/\s+/g, "");

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("shipping_address->>phone", cleanPhone)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

// @route GET /api/orders/:id — guest order tracking (order ID is unguessable, acts as access token)
export const getOrderById = async (req, res) => {
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", req.params.id).single();
  if (error || !data) return res.status(404).json({ message: "Order nahi mila" });
  res.json(data);
};

// @route GET /api/orders (admin) - all orders, optional ?status=
export const getAllOrders = async (req, res) => {
  let query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  if (req.query.status) query = query.eq("status", req.query.status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

// @route PUT /api/orders/:id/status (admin)
export const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const allowed = ["pending", "processing", "shipped", "delivered", "completed", "returned", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const { data: order } = await supabase.from("orders").select("*").eq("id", req.params.id).single();
  if (!order) return res.status(404).json({ message: "Order nahi mila" });

  const newHistory = [...(order.status_history || []), { status, note: note || "", at: new Date().toISOString() }];

  if (status === "returned") {
    for (const item of order.order_items) {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item.product).single();
      if (product) await supabase.from("products").update({ stock: product.stock + item.qty }).eq("id", item.product);
    }
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status, status_history: newHistory })
    .eq("id", req.params.id)
    .select(ORDER_SELECT)
    .single();

  if (error) return res.status(500).json({ message: error.message });

  if (status === "delivered" || status === "completed") {
    sendOrderStatusEmail(updated, status);
  }

  res.json(updated);
};
