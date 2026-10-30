import { getScopedStorageKey } from './accountStorage.js'

const STORAGE_KEY = 'ai-smart-diary.entries'

function readEntries() {
  const storedEntries = window.localStorage.getItem(getScopedStorageKey(STORAGE_KEY))
  if (storedEntries === null) return []

  const entries = JSON.parse(storedEntries)
  if (!Array.isArray(entries)) {
    throw new Error('Saved diary entries are not in a valid format.')
  }

  return entries
}

function writeEntries(entries) {
  window.localStorage.setItem(getScopedStorageKey(STORAGE_KEY), JSON.stringify(entries))
}

function createId() {
  if (typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getEntries() {
  return readEntries()
}

export function saveEntry(entry) {
  const entries = readEntries()
  const timestamp = new Date().toISOString()
  const savedEntry = {
    ...entry,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  writeEntries([savedEntry, ...entries])
  return savedEntry
}

export function updateEntry(id, updates) {
  const entries = readEntries()
  const entryIndex = entries.findIndex((entry) => entry.id === id)

  if (entryIndex === -1) {
    throw new Error(`Diary entry "${id}" could not be found.`)
  }

  const updatedEntry = {
    ...entries[entryIndex],
    ...updates,
    id: entries[entryIndex].id,
    createdAt: entries[entryIndex].createdAt,
    updatedAt: new Date().toISOString(),
  }

  entries[entryIndex] = updatedEntry
  writeEntries(entries)
  return updatedEntry
}

export function deleteEntry(id) {
  const entries = readEntries()
  const remainingEntries = entries.filter((entry) => entry.id !== id)

  if (remainingEntries.length === entries.length) {
    throw new Error(`Diary entry "${id}" could not be found.`)
  }

  writeEntries(remainingEntries)
}
