import "dotenv/config";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";

const run = async () => {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.log("❌ ADMIN_EMAIL / ADMIN_PASSWORD .env mein set karein");
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: existing } = await supabase.from("admin_users").select("id").eq("email", email).maybeSingle();

  if (existing) {
    await supabase.from("admin_users").update({ name, password_hash, role: "admin" }).eq("id", existing.id);
    console.log(`✅ Existing admin ${email} update ho gaya`);
  } else {
    const { error } = await supabase.from("admin_users").insert({ name, email, password_hash, role: "admin" });
    if (error) {
      console.log(`❌ Admin account nahi ban saka: ${error.message}`);
      process.exit(1);
    }
    console.log(`✅ Admin account bana diya gaya: ${email}`);
  }

  process.exit(0);
};

run();
