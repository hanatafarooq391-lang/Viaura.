import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { data, error } = await supabase
        .from("admin_users")
        .select("id, name, email, role")
        .eq("id", decoded.id)
        .single();

      if (error || !data) {
        return res.status(401).json({ message: "User nahi mila, dobara login karein" });
      }
      req.user = data;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalid hai, dobara login karein" });
    }
  }

  return res.status(401).json({ message: "Login required" });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Sirf admin hi ye kar sakta hai" });
};
