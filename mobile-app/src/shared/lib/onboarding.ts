import * as SecureStore from "expo-secure-store"

const ONBOARDING_KEY = "bookteka-onboarding-completed"

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY)
    return value === "true"
  } catch (error) {
    console.warn("Error checking onboarding status:", error)
    return false
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, "true")
  } catch (error) {
    console.warn("Error saving onboarding status:", error)
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY)
  } catch (error) {
    console.warn("Error resetting onboarding status:", error)
  }
}
