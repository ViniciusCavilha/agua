export interface AguaFirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AguaUserProfile {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  [key: string]: unknown;
}

export function waitForCurrentUser(): Promise<AguaFirebaseUser | null>;
export function getUserProfile(uid: string): Promise<AguaUserProfile | null>;
export function isProfileComplete(profile: AguaUserProfile | null): boolean;
