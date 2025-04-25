"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  userLocationAtom,
  type KrogerLocation,
  persistentKrogerUserAtom,
} from "@/store/atoms";

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const [, setUserLocation] = useAtom(userLocationAtom);
  const [user, setUserState] = useAtom(persistentKrogerUserAtom);
  const validationPerformedRef = useRef(false);

  // Fetch user location when user is available
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user?.id) return; // Only fetch location if we have a user

      try {
        const response = await fetch(`/api/user/location?krogerId=${user.id}`);

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

    // Fetch user location when user changes
    fetchUserLocation();
  }, [user?.id, setUserLocation]);

  // Effect to validate user session on page load
  useEffect(() => {
    const validateUserSession = async () => {
      // Skip if no stored user, already in auth process, or already validated
      if (
        !user ||
        window.location.pathname.includes("/auth/") ||
        validationPerformedRef.current
      ) {
        return;
      }

      validationPerformedRef.current = true;

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
      }
    };

    validateUserSession();
  }, [user?.id, setUserState]); // Only depend on user.id, not the whole user object

  return <>{children}</>;
}
