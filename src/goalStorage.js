const STORAGE_KEY = 'ai-smart-diary.goals'

function readGoals() {
  const storedGoals = window.localStorage.getItem(STORAGE_KEY)
  if (storedGoals === null) return []

  const goals = JSON.parse(storedGoals)
  if (!Array.isArray(goals)) {
    throw new Error('Saved goals are not in a valid format.')
  }

  return goals
}

function writeGoals(goals) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

function createId() {
  if (typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeGoal(goal) {
  const target = Number(goal.target)
  const currentProgress = Math.min(
    target,
    Math.max(0, Number(goal.currentProgress) || 0),
  )
  return {
    ...goal,
    target,
    currentProgress,
    status: currentProgress >= target ? 'Completed' : 'Active',
  }
}

export function getGoals() {
  return readGoals()
}

export function saveGoal(goal) {
  const target = Number(goal.target)
  if (!Number.isFinite(target) || target <= 0) {
    throw new Error('Goal target must be a number greater than zero.')
  }

  const timestamp = new Date().toISOString()
  const savedGoal = normalizeGoal({
    ...goal,
    id: createId(),
    currentProgress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  writeGoals([savedGoal, ...readGoals()])
  return savedGoal
}

export function updateGoal(id, updates) {
  const goals = readGoals()
  const goalIndex = goals.findIndex((goal) => goal.id === id)

  if (goalIndex === -1) {
    throw new Error(`Goal "${id}" could not be found.`)
  }

  const target = Number(updates.target ?? goals[goalIndex].target)
  if (!Number.isFinite(target) || target <= 0) {
    throw new Error('Goal target must be a number greater than zero.')
  }

  const updatedGoal = normalizeGoal({
    ...goals[goalIndex],
    ...updates,
    target,
    id: goals[goalIndex].id,
    createdAt: goals[goalIndex].createdAt,
    updatedAt: new Date().toISOString(),
  })
  goals[goalIndex] = updatedGoal
  writeGoals(goals)
  return updatedGoal
}

export function deleteGoal(id) {
  const goals = readGoals()
  const remainingGoals = goals.filter((goal) => goal.id !== id)

  if (remainingGoals.length === goals.length) {
    throw new Error(`Goal "${id}" could not be found.`)
  }

  writeGoals(remainingGoals)
}
