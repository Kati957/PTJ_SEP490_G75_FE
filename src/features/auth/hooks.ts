// Custom hooks for auth feature
import { useState } from "react";
import type { User } from "./types";
import { ROLES } from "../../constants/roles";

const mockUser: User = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: ROLES.EMPLOYER,
};

export const useAuth = () => {
  const [user] = useState<User | null>(mockUser);

  return {
    user,
    isAuthenticated: !!user,
  };
};
