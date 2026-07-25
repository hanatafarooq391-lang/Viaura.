/**
 * Free WhatsApp "click to chat" link generator.
 * Isme koi paid API/gateway ki zaroorat nahi — jab bhi naya order aaye,
 * admin panel mein real-time notification aayegi jisme ye link hoga.
 * Admin us par click kare ga to WhatsApp khul jayega with order details
 * already type ho kar — sirf Send dabana hoga.
 */

const ADMIN_WHATSAPP_NUMBER = (process.env.ADMIN_PHONE || "+923130699506").replace(/\D/g, "");

export const buildAdminOrderWhatsAppLink = (order, customerName) => {
  const itemsList = order.orderItems
    .map((i) => `- ${i.name} (${i.size || "N/A"}) x${i.qty}`)
    .join("\n");

  const message =
    `🛍️ *Naya Order Aya Hai - Viaura*\n\n` +
    `Order ID: ${order._id}\n` +
    `Customer: ${customerName}\n` +
    `Phone: ${order.shippingAddress.phone}\n` +
    `Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}\n\n` +
    `Items:\n${itemsList}\n\n` +
    `Delivery Charge: Rs. ${order.deliveryCharge}\n` +
    `Total: Rs. ${order.totalPrice}\n` +
    `Payment: Cash on Delivery`;

  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
