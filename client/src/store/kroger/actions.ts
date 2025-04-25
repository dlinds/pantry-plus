import { KrogerUser } from "./types";

// Initialize krogerUser from localStorage if available
export const getInitialKrogerUser = (): KrogerUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("krogerUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing stored kroger user:", error);
    return null;
  }
};
