// Kroger user authentication
export interface KrogerUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

// User location for Kroger store
export interface KrogerLocation {
  id: string;
  name: string;
  address: string;
}
