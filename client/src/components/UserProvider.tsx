"use client";

import { ReactNode, useEffect } from "react";
import { useAtom } from "jotai";
import {
  userLocationAtom,
  krogerUserAtom,
  type KrogerLocation,
  type KrogerUser,
  persistentKrogerUserAtom,
} from "@/store/atoms";

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const [, setUserLocation] = useAtom(userLocationAtom);
  const [, setKrogerUser] = useAtom(krogerUserAtom);
  const [user, setUserState] = useAtom(persistentKrogerUserAtom);

  useEffect(() => {
    // Fetch user location from API on mount
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("/api/user/location");

        if (response.ok) {
          const data = await response.json();

          if (data.location) {
            const location: KrogerLocation = {
              id: data.location.id,
              name: data.location.name,
              address: `${data.location.address.addressLine1}, ${data.location.address.city}, ${data.location.address.state} ${data.location.address.zipCode}`,
            };

            setUserLocation(location);
          }
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    // Fetch Kroger user profile if logged in
    const fetchKrogerUser = async () => {
      try {
        const response = await fetch("/api/auth/kroger/profile");

        if (response.ok) {
          const data = await response.json();

          if (data.user) {
            const user: KrogerUser = {
              id: data.user.id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              email: data.user.email,
            };

            setKrogerUser(user);
          }
        }
      } catch (error) {
        console.error("Error fetching Kroger user profile:", error);
      }
    };

    // Run both fetches in parallel
    Promise.all([fetchUserLocation(), fetchKrogerUser()]);
  }, [setUserLocation, setKrogerUser]);

  // Effect to validate user session on page load
  useEffect(() => {
    const validateUserSession = async () => {
      // Skip if no stored user or already in auth process
      if (!user || window.location.pathname.includes("/auth/")) {
        return;
      }

      try {
        console.log("Validating user session for:", user.id);

        const response = await fetch("/api/auth/kroger/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ krogerId: user.id }),
        });

        if (!response.ok) {
          console.log("Session validation failed, logging out");
          // If validation fails, clear the user data
          setUserState(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          // Refresh user data in our state
          console.log("Session validated, refreshing user data");
          setUserState(data.user);
        } else {
          console.log("Invalid session data, logging out");
          setUserState(null);
        }
      } catch (error) {
        console.error("Error validating user session:", error);
        // On error, keep the user logged in to avoid disruption
        // A more strict approach would be to log them out
      }
    };

    validateUserSession();
  }, [user, setUserState]);

  return <>{children}</>;
}
