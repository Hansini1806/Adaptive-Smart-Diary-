const STORAGE_KEY = 'ai-smart-diary.settings'

export const defaultSettings = {
  profile: {
    name: 'Hansini',
    email: '',
    bio: '',
  },
  theme: 'dark',
  notifications: {
    dailyReminder: false,
    goalReminders: false,
    moodReminders: false,
  },
  preferences: {
    defaultCategory: 'Personal',
    defaultMood: 'Good',
  },
}

function readSettings() {
  const storedSettings = window.localStorage.getItem(STORAGE_KEY)
  if (storedSettings === null) return structuredClone(defaultSettings)

  const parsedSettings = JSON.parse(storedSettings)
  if (!parsedSettings || typeof parsedSettings !== 'object' || Array.isArray(parsedSettings)) {
    throw new Error('Saved settings are not in a valid format.')
  }

  return {
    ...structuredClone(defaultSettings),
    ...parsedSettings,
    profile: {
      ...defaultSettings.profile,
      ...(parsedSettings.profile ?? {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(parsedSettings.notifications ?? {}),
    },
    preferences: {
      ...defaultSettings.preferences,
      ...(parsedSettings.preferences ?? {}),
    },
  }
}

export function getSettings() {
  return readSettings()
}

export function saveSettings(settings) {
  const savedSettings = {
    ...structuredClone(defaultSettings),
    ...settings,
    profile: {
      ...defaultSettings.profile,
      ...settings.profile,
    },
    notifications: {
      ...defaultSettings.notifications,
      ...settings.notifications,
    },
    preferences: {
      ...defaultSettings.preferences,
      ...settings.preferences,
    },
  }
  if (!['dark', 'light'].includes(savedSettings.theme)) {
    throw new Error('Theme must be Dark or Light.')
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSettings))
  return savedSettings
}

export function resetSettings() {
  window.localStorage.removeItem(STORAGE_KEY)
  return structuredClone(defaultSettings)
}
