import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext(null);
export const DELIVERY_CHARGE = 250; // Pakistan fixed delivery charge

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("viaura_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("viaura_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1, size = "", color = "") => {
    setItems((prev) => {
      const key = (p) => `${p.product}-${p.size}-${p.color}`;
      const newItem = {
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        stock: product.stock,
        size,
        color,
        qty,
      };
      const existing = prev.find((i) => key(i) === key(newItem));
      if (existing) {
        return prev.map((i) => (key(i) === key(newItem) ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, newItem];
    });
    toast.success(`${product.name} cart mein add ho gaya`);
  };

  const updateQty = (product, size, color, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.product === product && i.size === size && i.color === color ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (product, size, color) => {
    setItems((prev) => prev.filter((i) => !(i.product === product && i.size === size && i.color === color)));
  };

  const clearCart = () => setItems([]);

  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryCharge = items.length > 0 ? DELIVERY_CHARGE : 0;
  const totalPrice = itemsPrice + deliveryCharge;

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeFromCart, clearCart, itemsPrice, deliveryCharge, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
