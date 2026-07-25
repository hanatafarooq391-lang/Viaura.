import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
};
