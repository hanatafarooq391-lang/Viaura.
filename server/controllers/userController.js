import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// @route POST /api/users/login (admin only — customers don't have accounts)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email?.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Email ya password ghalat hai" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Email ya password ghalat hai" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Sirf admin login kar sakta hai" });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
