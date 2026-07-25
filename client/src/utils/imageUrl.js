// Product/category images ab Supabase Storage se seedhi absolute (https://...) URL ke
// saath aati hain, isliye kuch prepend karne ki zaroorat nahi - ye function future-proofing
// ke liye hai (agar kabhi relative path wapis use karna pade).
const API_ORIGIN = import.meta.env.VITE_API_URL || "";

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; // already a full URL
  return `${API_ORIGIN}${path}`;
};
