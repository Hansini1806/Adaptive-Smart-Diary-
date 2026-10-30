const activeUserStorageKey = 'ai-smart-diary.active-user'

export function getActiveUserId() {
  return window.localStorage.getItem(activeUserStorageKey)
}

export function setActiveUserId(userId) {
  if (userId) {
    window.localStorage.setItem(activeUserStorageKey, userId)
  } else {
    window.localStorage.removeItem(activeUserStorageKey)
  }
}

export function getScopedStorageKey(legacyKey, userId = getActiveUserId()) {
  if (!userId) throw new Error('A signed-in account is required to access diary data.')
  return `${legacyKey}.${userId}`
}

export function clearCurrentUserDiaryData() {
  for (const key of ['ai-smart-diary.entries', 'ai-smart-diary.goals']) {
    window.localStorage.removeItem(getScopedStorageKey(key))
    window.dispatchEvent(new StorageEvent('storage', {
      key: getScopedStorageKey(key),
    }))
  }
}
