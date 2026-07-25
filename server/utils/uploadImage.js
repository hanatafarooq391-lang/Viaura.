import { supabase } from "../config/supabase.js";

// Vercel serverless functions ki filesystem ephemeral hoti hai - local disk par images
// save karna kaam nahi karega. Isliye images Supabase Storage (bucket "uploads") mein
// jaati hain aur ek permanent public URL milta hai jo seedha DB mein save hota hai.
export const uploadImageToSupabase = async (file) => {
  if (!file) return "";

  const ext = file.originalname.split(".").pop();
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error } = await supabase.storage.from("uploads").upload(filename, file.buffer, {
    contentType: file.mimetype,
  });

  if (error) throw new Error(`Image upload nahi ho saki: ${error.message}`);

  const { data } = supabase.storage.from("uploads").getPublicUrl(filename);
  return data.publicUrl;
};
