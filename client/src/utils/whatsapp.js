// Deterministic WhatsApp click-to-chat link — mirrors server/utils/whatsapp.js
// Isay har order ke liye generate kiya ja sakta hai, chahe wo real-time aaya ho ya purana ho.

const ADMIN_WHATSAPP_NUMBER = "923130699506"; // country code ke sath, bina + ya spaces

export const buildAdminOrderWhatsAppLink = (order) => {
  const itemsList = order.orderItems
    .map((i) => `- ${i.name} (${i.size || "N/A"}) x${i.qty}`)
    .join("\n");

  const message =
    `🛍️ *Order - Viaura*\n\n` +
    `Order ID: ${order._id}\n` +
    `Customer: ${order.shippingAddress?.fullName}\n` +
    `Phone: ${order.shippingAddress?.phone}\n` +
    `Address: ${order.shippingAddress?.address}, ${order.shippingAddress?.city}\n\n` +
    `Items:\n${itemsList}\n\n` +
    `Delivery Charge: Rs. ${order.deliveryCharge}\n` +
    `Total: Rs. ${order.totalPrice}\n` +
    `Payment: Cash on Delivery\n` +
    `Status: ${order.status}`;

  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Customer ke apne (delivery) number par WhatsApp chat kholta hai — order confirmation
// bhejne ke liye. Pakistani numbers "03XXXXXXXXX" ko "923XXXXXXXXX" format mein convert karta hai.
const toInternationalPkNumber = (phone) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
};

export const buildCustomerWhatsAppLink = (order) => {
  const itemsList = order.orderItems
    .map((i) => `- ${i.name} (${i.size || "N/A"}) x${i.qty}`)
    .join("\n");

  const message =
    `Assalam-o-Alaikum ${order.shippingAddress?.fullName},\n\n` +
    `Aapka VIAURA order confirm ho gaya hai! ✅\n\n` +
    `Order ID: ${order._id}\n` +
    `Items:\n${itemsList}\n\n` +
    `Delivery Charge: Rs. ${order.deliveryCharge}\n` +
    `Total: Rs. ${order.totalPrice}\n` +
    `Payment: Cash on Delivery\n` +
    `Status: ${order.status}\n\n` +
    `Shukriya ke aap ne VIAURA choose kiya!`;

  const customerNumber = toInternationalPkNumber(order.shippingAddress?.phone);
  return `https://wa.me/${customerNumber}?text=${encodeURIComponent(message)}`;
};
