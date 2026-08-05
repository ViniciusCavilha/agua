export type AppSettings = {
  compactMode: boolean;
  emailAlerts: boolean;
  pushAlerts: boolean;
  weeklySummary: boolean;
  simulationMode: boolean;
  anomalyDemo: boolean;
  readingInterval: number;
  defaultPeriod: string;
  measurementUnit: string;
};

export declare const applySettings: (settings: Partial<AppSettings>) => AppSettings;
export declare const getSettings: () => AppSettings;
export declare const saveSettings: (settings: Partial<AppSettings>) => AppSettings;
export declare const resetSettings: () => AppSettings;
export declare const formatVolume: (liters: number, settings?: Partial<AppSettings>) => string;
export declare const getDefaultPeriodRoute: (period: string) => string;
