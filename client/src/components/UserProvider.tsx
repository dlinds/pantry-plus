"use client";

import { ReactNode, useEffect } from "react";
import { useAtom } from "jotai";
import {
  userLocationAtom,
  krogerUserAtom,
  type KrogerLocation,
  type KrogerUser,
} from "@/store/atoms";

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const [, setUserLocation] = useAtom(userLocationAtom);
  const [, setKrogerUser] = useAtom(krogerUserAtom);

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

  return <>{children}</>;
}
