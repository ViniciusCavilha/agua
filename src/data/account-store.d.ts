export const SENAC_UNITS: string[];
export function isSenacInstitution(value: string): boolean;
export function getAvailableUnits(company: string): string[];
export function getAccount(): {
  name: string;
  phone: string;
  email: string;
  company: string;
  unit: string;
};
export function saveAccount(account: Partial<ReturnType<typeof getAccount>>): ReturnType<typeof getAccount>;
export function updateAccount(account: Partial<ReturnType<typeof getAccount>>): ReturnType<typeof getAccount>;
export function deleteAccount(): ReturnType<typeof getAccount>;

