export const GOOGLE_ONBOARDING_STORAGE_KEY = 'googleOnboarding';

export interface GoogleOnboardingData {
  idToken: string;
  email: string;
  name?: string;
  picture?: string;
  availableRoles: string[];
}

export const saveGoogleOnboardingData = (payload: GoogleOnboardingData): void => {
  sessionStorage.setItem(GOOGLE_ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
};

export const getGoogleOnboardingData = (): GoogleOnboardingData | null => {
  const raw = sessionStorage.getItem(GOOGLE_ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleOnboardingData;
  } catch {
    return null;
  }
};

export const clearGoogleOnboardingData = (): void => {
  sessionStorage.removeItem(GOOGLE_ONBOARDING_STORAGE_KEY);
};
