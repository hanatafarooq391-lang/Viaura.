import nodemailer from "nodemailer";

/**
 * Free email sending using Gmail SMTP + an "App Password" (not your real Gmail password).
 * Setup: .env mein EMAIL_USER (Gmail address) aur EMAIL_PASS (16-char App Password) daalein.
 * App Password banane ka tareeqa README.md mein hai.
 * Agar EMAIL_USER/EMAIL_PASS set nahi hain, ye functions chup chaap skip ho jayenge (kabhi fail nahi honge).
 *
 * Spam mein jaane se bachane ke liye:
 * - Har email ka ek plain-text version bhi bheja jata hai (sirf HTML nahi) - spam filters isay pasand karte hain
 * - Subject lines simple rakhi hain (emoji, ALL CAPS, "FREE" jaisay spam trigger words nahi)
 * - Reply-To header set hai taake genuine business email lage
 * - Pehli baar customer ko email milne par usay "Not Spam" mark karna chahiye - iske baad Gmail
 *   seekh jata hai aur agli emails seedhi inbox mein aati hain
 */

let transporter = null;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const wrapEmail = (bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1F2933">
    <h2 style="color:#1E3A52;margin-bottom:4px">Viaura</h2>
    ${bodyHtml}
    <p style="color:#64748B;font-size:12px;margin-top:30px">Thank you for shopping with Viaura.</p>
  </div>`;

const itemsTable = (order) => {
  const rows = order.orderItems
    .map((i) => `<tr><td style="padding:6px 0">${i.name} ${i.size ? `(${i.size})` : ""} x${i.qty}</td><td style="padding:6px 0;text-align:right">Rs. ${(i.price * i.qty).toLocaleString()}</td></tr>`)
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #ddd">Delivery Charge</td><td style="text-align:right;padding-top:10px;border-top:1px solid #ddd">Rs. ${order.deliveryCharge}</td></tr>
      <tr><td style="font-weight:bold;padding-top:6px">Total</td><td style="text-align:right;font-weight:bold;padding-top:6px">Rs. ${order.totalPrice.toLocaleString()}</td></tr>
    </table>`;
};

const itemsText = (order) =>
  order.orderItems.map((i) => `- ${i.name} ${i.size ? `(${i.size})` : ""} x${i.qty} - Rs. ${(i.price * i.qty).toLocaleString()}`).join("\n");

const send = async (to, subject, html, text) => {
  const t = getTransporter();
  if (!t || !to) return; // silently skip if not configured or no recipient
  try {
    await t.sendMail({
      from: `"Viaura" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to,
      subject,
      text, // plain-text alternative — improves inbox placement a lot
      html,
    });
  } catch (err) {
    console.error("⚠️ Email bhejne mein masla:", err.message);
  }
};

// 1) Customer ko order place hote hi confirmation
export const sendOrderConfirmationEmail = async (order, customerEmail) => {
  const orderNo = order._id.toString().slice(-8).toUpperCase();
  const html = wrapEmail(
    `<p>Hello ${order.shippingAddress.fullName},</p>
     <p>Thank you for your order. Here are your order details:</p>
     <p><strong>Order ID:</strong> ${order._id}</p>
     ${itemsTable(order)}
     <p><strong>Payment method:</strong> Cash on Delivery</p>
     <p><strong>Delivery address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
     <p style="margin-top:20px">Please keep this Order ID for tracking your order.</p>`
  );
  const text =
    `Hello ${order.shippingAddress.fullName},\n\n` +
    `Thank you for your order. Order ID: ${order._id}\n\n` +
    `${itemsText(order)}\n\n` +
    `Delivery Charge: Rs. ${order.deliveryCharge}\nTotal: Rs. ${order.totalPrice}\n` +
    `Payment method: Cash on Delivery\n` +
    `Delivery address: ${order.shippingAddress.address}, ${order.shippingAddress.city}\n\n` +
    `Please keep this Order ID for tracking your order.`;

  await send(customerEmail, `Your Viaura order ${orderNo} is confirmed`, html, text);
};

// 2) Customer ko status update par email (delivered / completed)
export const sendOrderStatusEmail = async (order, status) => {
  const orderNo = order._id.toString().slice(-8).toUpperCase();
  const messages = {
    delivered: {
      subject: `Your Viaura order ${orderNo} has been delivered`,
      body: `<p>Hello ${order.shippingAddress.fullName},</p><p>Your order has been delivered. We hope you enjoy it.</p>`,
      text: `Hello ${order.shippingAddress.fullName},\n\nYour order has been delivered. We hope you enjoy it.`,
    },
    completed: {
      subject: `Your Viaura order ${orderNo} is complete`,
      body: `<p>Hello ${order.shippingAddress.fullName},</p><p>Your order is now complete. Thank you for shopping with Viaura.</p>`,
      text: `Hello ${order.shippingAddress.fullName},\n\nYour order is now complete. Thank you for shopping with Viaura.`,
    },
  };

  const msg = messages[status];
  if (!msg) return; // sirf delivered/completed par email

  const html = wrapEmail(`${msg.body}<p><strong>Order ID:</strong> ${order._id}</p>${itemsTable(order)}`);
  const text = `${msg.text}\n\nOrder ID: ${order._id}\n\n${itemsText(order)}\n\nTotal: Rs. ${order.totalPrice}`;

  await send(order.shippingAddress.email, msg.subject, html, text);
};

// 3) Admin ko naya order aane par email (WhatsApp click-link ke ilawa ek aur channel)
export const sendAdminNewOrderEmail = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  const orderNo = order._id.toString().slice(-8).toUpperCase();

  const html = wrapEmail(
    `<p>A new order has been placed on Viaura:</p>
     <p><strong>Order ID:</strong> ${order._id}</p>
     <p><strong>Customer:</strong> ${order.shippingAddress.fullName}</p>
     <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
     <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
     ${itemsTable(order)}
     <p><strong>Payment method:</strong> Cash on Delivery</p>`
  );
  const text =
    `A new order has been placed on Viaura.\n\n` +
    `Order ID: ${order._id}\nCustomer: ${order.shippingAddress.fullName}\nPhone: ${order.shippingAddress.phone}\n` +
    `Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}\n\n` +
    `${itemsText(order)}\n\nTotal: Rs. ${order.totalPrice}\nPayment method: Cash on Delivery`;

  await send(adminEmail, `New order ${orderNo} - Viaura`, html, text);
};
