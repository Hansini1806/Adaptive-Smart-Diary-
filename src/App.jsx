import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  Bold,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleCheck,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Flame,
  Heart,
  House,
  Italic,
  Lightbulb,
  List,
  NotebookPen,
  Minus,
  Pencil,
  Plus,
  Quote,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  Trash2,
  RotateCcw,
  Download,
  Moon,
  Sun,
  UserRound,
  ShieldCheck,
  Underline,
  WandSparkles,
} from 'lucide-react'
import './App.css'
import './NewEntry.css'
import './Entries.css'
import './Calendar.css'
import './Insights.css'
import './MoodTracker.css'
import './AIAssistant.css'
import './Goals.css'
import './Settings.css'
import { deleteEntry, getEntries, saveEntry, updateEntry } from './diaryStorage.js'
import { deleteGoal, getGoals, saveGoal, updateGoal } from './goalStorage.js'
import {
  defaultSettings,
  getSettings,
  resetSettings,
  saveSettings,
} from './settingsStorage.js'

const navigationItems = [
  { label: 'Home', icon: House, path: '/' },
  { label: 'Entries', icon: NotebookPen, path: '/entries' },
  { label: 'Calendar', icon: CalendarDays, path: '/calendar' },
  { label: 'Insights', icon: ChartNoAxesColumnIncreasing, path: '/insights' },
  { label: 'AI Assistant', icon: BrainCircuit, path: '/ai-assistant' },
  { label: 'Goals', icon: Target, path: '/goals' },
  { label: 'Mood Tracker', icon: Heart, path: '/mood-tracker' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

const placeholderPages = {
  '/entries': {
    title: 'Entries',
    description: 'Revisit the thoughts, moments, and memories you have written down.',
    icon: NotebookPen,
  },
  '/calendar': {
    title: 'Calendar',
    description: 'See your journaling journey unfold, one day at a time.',
    icon: CalendarDays,
  },
  '/insights': {
    title: 'Insights',
    description: 'Notice the themes and patterns woven through your reflections.',
    icon: ChartNoAxesColumnIncreasing,
  },
  '/mood-tracker': {
    title: 'Mood Tracker',
    description: 'Make room for the feelings that shape each day.',
    icon: Heart,
  },
}

const recentEntries = [
  {
    title: 'A little more present',
    excerpt:
      'Today felt lighter than usual. I took a longer walk after lunch and let myself enjoy the quiet...',
    date: 'Today',
    time: '6:42 PM',
    mood: 'Grateful',
    moodColor: 'lavender',
    category: 'Personal growth',
    icon: Sparkles,
  },
  {
    title: 'Finding my rhythm',
    excerpt:
      'I finally made space for the things I have been putting off. Small steps are still steps forward.',
    date: 'Yesterday',
    time: '9:18 PM',
    mood: 'Calm',
    moodColor: 'blue',
    category: 'Daily reflection',
    icon: Clock3,
  },
  {
    title: 'A moment worth keeping',
    excerpt:
      'Dinner with everyone around the table reminded me how much I have to be thankful for.',
    date: 'Oct 4',
    time: '8:05 PM',
    mood: 'Happy',
    moodColor: 'pink',
    category: 'Memories',
    icon: Heart,
  },
]

const statistics = [
  {
    label: 'Entries this month',
    value: '18',
    detail: '+4 from last month',
    icon: NotebookPen,
    color: 'violet',
  },
  {
    label: 'Days journaled',
    value: '24',
    detail: 'You’re building a habit',
    icon: CalendarDays,
    color: 'blue',
  },
  {
    label: 'Average mood',
    value: '8.6',
    detail: 'Looking brighter lately',
    icon: Heart,
    color: 'pink',
  },
  {
    label: 'Current streak',
    value: '7 days',
    detail: 'Your best is 12 days',
    icon: Flame,
    color: 'orange',
  },
]

function getDateTime() {
  const now = new Date()

  return {
    date: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(now),
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(now),
    greeting:
      now.getHours() < 12
        ? 'Good morning'
        : now.getHours() < 18
          ? 'Good afternoon'
          : 'Good evening',
  }
}

function Sidebar({ currentPage, onNavigate, onNewEntry }) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="/"
        aria-label="AI Smart Diary home"
        onClick={(event) => {
          event.preventDefault()
          onNavigate('/')
        }}
      >
        <span className="brand-icon"><BookOpen size={22} strokeWidth={1.8} /></span>
        <span className="brand-copy">
          <strong>AI Smart Diary</strong>
          <span>Your thoughts, evolved.</span>
        </span>
      </a>

      <button
        className="new-entry-button"
        type="button"
        onClick={onNewEntry}
      >
        <Plus size={19} strokeWidth={2.2} />
        <span>New Entry</span>
      </button>

      <nav className="primary-navigation" aria-label="Main navigation">
        {navigationItems.map(({ label, icon: Icon, path }) => (
          <button
            className={`navigation-item${currentPage === label ? ' is-active' : ''}`}
            key={label}
            type="button"
            aria-current={currentPage === label ? 'page' : undefined}
            onClick={() => onNavigate(path)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'AI Assistant' && <span className="nav-new-badge">NEW</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-widgets">
        <section className="streak-card" aria-labelledby="streak-title">
          <div className="widget-heading">
            <span className="widget-icon streak-icon"><Flame size={17} /></span>
            <span id="streak-title">Daily Streak</span>
            <span className="streak-count">7</span>
          </div>
          <p className="streak-message">7 days in a row!</p>
          <div className="streak-days" aria-label="Journaled every day this week">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <span className="streak-day is-complete" key={`${day}-${index}`}>
                <span>{day}</span>
                <span className="day-check">✓</span>
              </span>
            ))}
          </div>
        </section>

        <section className="mood-summary-card" aria-labelledby="mood-summary-title">
          <div className="mood-summary-heading">
            <span className="widget-icon mood-icon"><Sparkles size={16} /></span>
            <span id="mood-summary-title">AI Mood Summary</span>
          </div>
          <p>You&apos;ve been feeling positive lately!</p>
          <div className="mood-summary-footer">
            <span><span className="mood-indicator" /> Your week is trending up</span>
            <ChevronRight size={15} />
          </div>
        </section>
      </div>

      <div className="sidebar-footer">
        <span className="privacy-dot" />
        Your thoughts stay yours
      </div>
    </aside>
  )
}

function Topbar({ dateTime, profile }) {
  const profileName = profile.name.trim() || 'Hansini'
  const profileInitial = [...profileName][0]?.toUpperCase() || 'H'
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brand-icon"><BookOpen size={20} /></span>
        <strong>AI Smart Diary</strong>
      </div>
      <div className="topbar-spacer" />
      <div className="date-time">
        <span>{dateTime.date}</span>
        <span className="date-time-divider" />
        <span>{dateTime.time}</span>
      </div>
      <button className="icon-button notification-button" type="button" aria-label="Notifications">
        <Bell size={19} strokeWidth={1.8} />
        <span className="notification-dot" />
      </button>
      <div className="profile-avatar" aria-label={`${profileName}'s profile`}>{profileInitial}</div>
      <div className="profile-greeting">
        <strong>{dateTime.greeting}, {profileName} <span aria-hidden="true">👋</span></strong>
        <span>Good to see you again</span>
      </div>
    </header>
  )
}

function EntryCard({ entry }) {
  const Icon = entry.icon

  return (
    <article className="entry-card">
      <div className="entry-card-top">
        <span className="entry-category">
          <Icon size={14} />
          {entry.category}
        </span>
        <button className="entry-more" type="button" aria-label={`Open ${entry.title}`}>
          <ArrowUpRight size={17} />
        </button>
      </div>
      <h3>{entry.title}</h3>
      <p className="entry-excerpt">{entry.excerpt}</p>
      <div className="entry-meta">
        <span className="entry-date">{entry.date}<span>·</span>{entry.time}</span>
        <span className={`mood-pill mood-${entry.moodColor}`}>
          <span className="mood-pill-dot" />
          {entry.mood}
        </span>
      </div>
    </article>
  )
}

function StatCard({ statistic }) {
  const Icon = statistic.icon

  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${statistic.color}`}><Icon size={18} /></div>
      <p className="stat-label">{statistic.label}</p>
      <div className="stat-value-row">
        <strong>{statistic.value}</strong>
        <span className="stat-trend"><ArrowUpRight size={13} /></span>
      </div>
      <span className="stat-detail">{statistic.detail}</span>
    </article>
  )
}

function getCategoryGroups(category = '') {
  const normalizedCategory = category.toLowerCase()
  const groups = []

  if (normalizedCategory.includes('personal')
    || normalizedCategory.includes('gratitude')
    || normalizedCategory.includes('growth')
    || normalizedCategory.includes('reflection')) {
    groups.push('Personal')
  }
  if (normalizedCategory.includes('work')) groups.push('Work')
  if (normalizedCategory.includes('study')) groups.push('Study')
  if (normalizedCategory.includes('health')) groups.push('Health')

  return groups.length > 0 ? groups : ['Other']
}

function EntriesPage({ onNewEntry, onEditEntry }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('All moods')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [entryState, setEntryState] = useState(() => {
    try {
      return { entries: getEntries(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { entries: [], error: `Could not load diary entries: ${message}` }
    }
  })

  const refreshEntries = () => {
    try {
      setEntryState({ entries: getEntries(), error: '' })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setEntryState((current) => ({
        ...current,
        error: `Could not load diary entries: ${message}`,
      }))
    }
  }

  const handleDelete = (entry) => {
    const confirmed = window.confirm(`Delete "${entry.title || 'Untitled entry'}"?`)
    if (!confirmed) return

    try {
      deleteEntry(entry.id)
      refreshEntries()
      setSelectedEntry(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setEntryState((current) => ({
        ...current,
        error: `Could not delete this entry: ${message}`,
      }))
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredEntries = [...entryState.entries]
    .filter((entry) => {
      const matchesQuery = !normalizedQuery
        || (entry.title ?? '').toLowerCase().includes(normalizedQuery)
        || (entry.content ?? '').toLowerCase().includes(normalizedQuery)
      const matchesMood = moodFilter === 'All moods' || entry.mood === moodFilter
      const matchesCategory = categoryFilter === 'All categories'
        || getCategoryGroups(entry.category).includes(categoryFilter)

      return matchesQuery && matchesMood && matchesCategory
    })
    .sort((first, second) =>
      (second.updatedAt ?? '').localeCompare(first.updatedAt ?? ''),
    )

  return (
    <div className="entries-page">
      <section className="entries-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Entries</h1>
          <p>Revisit the thoughts, moments, and memories you have written down.</p>
        </div>
        <button className="entries-new-button" type="button" onClick={onNewEntry}>
          <Plus size={16} />
          New Entry
        </button>
      </section>

      {entryState.error && (
        <p className="entries-error" role="alert">{entryState.error}</p>
      )}

      <section className="entries-toolbar" aria-label="Search and filter entries">
        <label className="entries-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your entries..."
            aria-label="Search entries by title or content"
          />
        </label>
        <label className="entries-filter">
          <span className="sr-only">Filter by mood</span>
          <select
            value={moodFilter}
            onChange={(event) => setMoodFilter(event.target.value)}
            aria-label="Filter by mood"
          >
            {['All moods', 'Great', 'Good', 'Okay', 'Tired', 'Sad', 'Stressed'].map((mood) => (
              <option key={mood}>{mood}</option>
            ))}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </label>
        <label className="entries-filter">
          <span className="sr-only">Filter by category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filter by category"
          >
            {['All categories', 'Personal', 'Work', 'Study', 'Health', 'Other'].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </label>
      </section>

      <div className="entries-results-heading">
        <h2>{searchQuery || moodFilter !== 'All moods' || categoryFilter !== 'All categories'
          ? 'Search results'
          : 'All entries'}</h2>
        <span>{filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {filteredEntries.length > 0 ? (
        <section className="saved-entries-grid" aria-label="Saved diary entries">
          {filteredEntries.map((entry) => (
            <article
              className="saved-entry-card"
              key={entry.id}
              role="button"
              tabIndex={0}
              aria-label={`Open entry ${entry.title || 'Untitled entry'}`}
              onClick={() => setSelectedEntry(entry)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedEntry(entry)
                }
              }}
            >
              <div className="saved-entry-card-top">
                <span className="saved-entry-category">{entry.category || 'Uncategorized'}</span>
                <span className={`entry-status status-${(entry.status ?? 'Draft').toLowerCase()}`}>
                  {entry.status || 'Draft'}
                </span>
              </div>
              <h3>{entry.title || 'Untitled entry'}</h3>
              <p className="saved-entry-preview">
                {entry.content?.trim() || 'No writing in this entry yet.'}
              </p>
              <div className="saved-entry-meta">
                <span>{entry.date || 'Date unavailable'}<span>·</span>{entry.time || 'Time unavailable'}</span>
                <span className={`saved-entry-mood${entry.mood ? '' : ' mood-not-set'}`}>
                  <span className="mood-pill-dot" />
                  {entry.mood || 'No mood'}
                </span>
              </div>
            </article>
          ))}
        </section>
      ) : entryState.entries.length === 0 ? (
        <section className="entries-empty-state">
          <span className="entries-empty-icon"><NotebookPen size={23} /></span>
          <h2>No diary entries yet</h2>
          <p>Start writing your first entry to see it here.</p>
          <button className="entries-new-button" type="button" onClick={onNewEntry}>
            <Plus size={16} />
            New Entry
          </button>
        </section>
      ) : (
        <section className="entries-empty-state entries-no-results">
          <span className="entries-empty-icon"><Search size={22} /></span>
          <h2>No matching entries</h2>
          <p>Try a different search or adjust your filters.</p>
          <button
            className="entries-reset-button"
            type="button"
            onClick={() => {
              setSearchQuery('')
              setMoodFilter('All moods')
              setCategoryFilter('All categories')
            }}
          >
            Clear filters
          </button>
        </section>
      )}

      {selectedEntry && (
        <div
          className="entry-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedEntry(null)
          }}
        >
          <section
            className="entry-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-detail-title"
          >
            <div className="entry-detail-top">
              <span className="saved-entry-category">
                {selectedEntry.category || 'Uncategorized'}
              </span>
              <span className={`entry-status status-${(selectedEntry.status ?? 'Draft').toLowerCase()}`}>
                {selectedEntry.status || 'Draft'}
              </span>
            </div>
            <h2 id="entry-detail-title">{selectedEntry.title || 'Untitled entry'}</h2>
            <div className="entry-detail-meta">
              <span>{selectedEntry.date || 'Date unavailable'}</span>
              <span>·</span>
              <span>{selectedEntry.time || 'Time unavailable'}</span>
              <span className="entry-detail-mood">{selectedEntry.mood || 'No mood selected'}</span>
            </div>
            <p className="entry-detail-content">
              {selectedEntry.content || 'No writing in this entry yet.'}
            </p>
            <div className="entry-detail-actions">
              <button
                className="entry-delete-button"
                type="button"
                onClick={() => handleDelete(selectedEntry)}
              >
                <Trash2 size={15} />
                Delete
              </button>
              <button
                className="entry-edit-button"
                type="button"
                onClick={() => onEditEntry(selectedEntry)}
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                className="entry-close-button"
                type="button"
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseEntryDate(value) {
  if (typeof value !== 'string' || value.trim() === '') return null

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (
      date.getFullYear() === Number(year)
      && date.getMonth() === Number(month) - 1
      && date.getDate() === Number(day)
    ) {
      return date
    }
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatEntryDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const trackedMoods = ['Great', 'Good', 'Okay', 'Tired', 'Sad', 'Stressed']
const trackedCategories = ['Personal', 'Work', 'Study', 'Health', 'Other']

function getEntryCategoryGroups(category = '') {
  const normalizedCategory = category.toLowerCase()
  const groups = []

  if (normalizedCategory.includes('personal')
    || normalizedCategory.includes('gratitude')
    || normalizedCategory.includes('growth')
    || normalizedCategory.includes('reflection')) {
    groups.push('Personal')
  }
  if (normalizedCategory.includes('work')) groups.push('Work')
  if (normalizedCategory.includes('study')) groups.push('Study')
  if (normalizedCategory.includes('health')) groups.push('Health')

  return groups.length > 0 ? groups : ['Other']
}

function countWords(content = '') {
  const trimmedContent = content.trim()
  return trimmedContent ? trimmedContent.split(/\s+/).length : 0
}

function getInsightData(entries, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayKey = getLocalDateKey(today)
  const datedEntries = entries
    .map((entry) => ({ entry, date: parseEntryDate(entry.date) }))
    .filter(({ date }) => date !== null)
  const dateKeys = new Set(datedEntries.map(({ date }) => getLocalDateKey(date)))
  const moodCounts = trackedMoods.map((mood) => ({
    label: mood,
    count: entries.filter((entry) => entry.mood === mood).length,
  }))
  const totalMoods = moodCounts.reduce((total, mood) => total + mood.count, 0)
  const mostCommonMood = moodCounts.reduce(
    (mostCommon, mood) => mood.count > mostCommon.count ? mood : mostCommon,
    { label: '', count: 0 },
  )
  const categoryCounts = trackedCategories.map((category) => ({
    label: category,
    count: entries.filter((entry) =>
      getEntryCategoryGroups(entry.category).includes(category),
    ).length,
  }))
  const recentDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (13 - index))
    const key = getLocalDateKey(date)
    return {
      key,
      date,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      count: datedEntries.filter(({ date: entryDate }) =>
        getLocalDateKey(entryDate) === key,
      ).length,
    }
  })
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const weekStartKey = getLocalDateKey(weekStart)
  const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-`
  const entriesThisWeek = datedEntries.filter(({ date }) => {
    const dateKey = getLocalDateKey(date)
    return dateKey >= weekStartKey && dateKey <= todayKey
  }).length
  const entriesThisMonth = datedEntries.filter(({ date }) =>
    getLocalDateKey(date).startsWith(monthPrefix),
  ).length
  let streak = 0
  const streakStart = new Date(today)
  if (!dateKeys.has(todayKey)) streakStart.setDate(streakStart.getDate() - 1)
  for (let offset = 0; ; offset += 1) {
    const date = new Date(streakStart)
    date.setDate(streakStart.getDate() - offset)
    if (!dateKeys.has(getLocalDateKey(date))) break
    streak += 1
  }

  const wordCounts = entries.map((entry) => ({
    title: entry.title?.trim() || 'Untitled entry',
    words: countWords(entry.content ?? ''),
  }))
  const totalWords = wordCounts.reduce((total, entry) => total + entry.words, 0)
  const longestEntry = wordCounts.reduce(
    (longest, entry) => entry.words > longest.words ? entry : longest,
    { title: '', words: 0 },
  )
  const weekdayCounts = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    label: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
      new Date(2024, 0, 7 + weekday),
    ),
    count: datedEntries.filter(({ date }) => date.getDay() === weekday).length,
  }))
  const mostActiveDay = weekdayCounts.reduce(
    (mostActive, day) => day.count > mostActive.count ? day : mostActive,
    { label: '', count: 0 },
  )

  return {
    totalEntries: entries.length,
    publishedEntries: entries.filter((entry) => entry.status === 'Published').length,
    draftEntries: entries.filter((entry) => entry.status === 'Draft').length,
    streak,
    entriesThisWeek,
    entriesThisMonth,
    moodCounts,
    totalMoods,
    mostCommonMood: mostCommonMood.count > 0 ? mostCommonMood.label : '—',
    categoryCounts,
    recentDays,
    totalWords,
    averageWords: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
    longestEntry,
    mostActiveDay: mostActiveDay.count > 0 ? mostActiveDay.label : '—',
  }
}

function InsightStatCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="insight-stat-card">
      <span className={`insight-stat-icon insight-tone-${tone}`}><Icon size={17} /></span>
      <span className="insight-stat-label">{label}</span>
      <strong className="insight-stat-value">{value}</strong>
      <span className="insight-stat-detail">{detail}</span>
    </article>
  )
}

function EntriesOverTimeChart({ days }) {
  const chartWidth = 600
  const chartHeight = 190
  const left = 28
  const right = 580
  const top = 15
  const bottom = 142
  const maxCount = Math.max(1, ...days.map((day) => day.count))
  const points = days.map((day, index) => ({
    ...day,
    x: left + (index * (right - left)) / (days.length - 1),
    y: bottom - (day.count / maxCount) * (bottom - top),
  }))
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPoints = `${left},${bottom} ${linePoints} ${right},${bottom}`
  const labelIndexes = [0, 3, 6, 9, 13]

  return (
    <div className="entries-over-time-chart">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label="Entries per day during the past 14 days"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="entries-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a57ae0" stopOpacity="0.27" />
            <stop offset="100%" stopColor="#a57ae0" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = top + (line * (bottom - top)) / 3
          return (
            <line
              key={line}
              x1={left}
              x2={right}
              y1={y}
              y2={y}
              stroke="#302d3b"
              strokeDasharray="3 5"
            />
          )
        })}
        <polygon points={areaPoints} fill="url(#entries-area-fill)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#ad83e9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r="5" fill="#171521" stroke="#bc9aed" strokeWidth="2" />
            <title>{`${formatEntryDate(point.date)}: ${point.count} ${point.count === 1 ? 'entry' : 'entries'}`}</title>
          </g>
        ))}
        {labelIndexes.map((index) => (
          <text
            key={days[index].key}
            x={points[index].x}
            y="173"
            fill="#8b8698"
            fontSize="10"
            textAnchor={index === 0 ? 'start' : index === 13 ? 'end' : 'middle'}
          >
            {`${days[index].label} ${days[index].date.getDate()}`}
          </text>
        ))}
      </svg>
    </div>
  )
}

function InsightsPage({ onNewEntry }) {
  const [entryState, setEntryState] = useState(() => {
    try {
      return { entries: getEntries(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { entries: [], error: `Could not load diary insights: ${message}` }
    }
  })

  useEffect(() => {
    const refreshEntries = () => {
      try {
        setEntryState({ entries: getEntries(), error: '' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unknown storage error occurred.'
        setEntryState((current) => ({
          ...current,
          error: `Could not load diary insights: ${message}`,
        }))
      }
    }
    window.addEventListener('storage', refreshEntries)
    return () => window.removeEventListener('storage', refreshEntries)
  }, [])

  const insights = getInsightData(entryState.entries)
  const maxMoodCount = Math.max(1, ...insights.moodCounts.map((mood) => mood.count))
  const maxCategoryCount = Math.max(1, ...insights.categoryCounts.map((category) => category.count))
  const statCards = [
    { label: 'Total Entries', value: insights.totalEntries, detail: 'All saved entries', icon: NotebookPen, tone: 'violet' },
    { label: 'Published Entries', value: insights.publishedEntries, detail: 'Shared with your diary', icon: Check, tone: 'green' },
    { label: 'Draft Entries', value: insights.draftEntries, detail: 'Still in progress', icon: Pencil, tone: 'amber' },
    { label: 'Current Writing Streak', value: `${insights.streak} ${insights.streak === 1 ? 'day' : 'days'}`, detail: 'Consecutive journaling days', icon: Flame, tone: 'orange' },
    { label: 'Entries This Week', value: insights.entriesThisWeek, detail: 'Last 7 days', icon: CalendarDays, tone: 'blue' },
    { label: 'Entries This Month', value: insights.entriesThisMonth, detail: 'Current calendar month', icon: CalendarDays, tone: 'pink' },
  ]

  return (
    <div className="insights-page">
      <section className="insights-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Insights</h1>
          <p>Notice the themes and patterns woven through your reflections.</p>
        </div>
      </section>

      {entryState.error && <p className="entries-error" role="alert">{entryState.error}</p>}

      {entryState.entries.length === 0 ? (
        <section className="insights-empty-state">
          <span className="insights-empty-icon"><ChartNoAxesColumnIncreasing size={23} /></span>
          <h2>Start journaling to see your insights.</h2>
          <p>Your writing patterns, moods, and moments will come together here.</p>
          <button className="entries-new-button" type="button" onClick={onNewEntry}>
            <Plus size={16} />
            New Entry
          </button>
        </section>
      ) : (
        <>
          <section className="insights-section" aria-labelledby="insights-overview-title">
            <div className="insights-section-heading">
              <div>
                <h2 id="insights-overview-title">Overview</h2>
                <p>A snapshot of your journaling journey.</p>
              </div>
            </div>
            <div className="insights-stats-grid">
              {statCards.map((stat) => <InsightStatCard key={stat.label} {...stat} />)}
            </div>
          </section>

          <div className="insights-chart-grid">
            <section className="insights-panel mood-overview-panel" aria-labelledby="mood-overview-title">
              <div className="insights-panel-heading">
                <div>
                  <h2 id="mood-overview-title">Mood Overview</h2>
                  <p>Your recorded moods at a glance.</p>
                </div>
                <span className="insights-panel-icon mood-panel-icon"><Heart size={16} /></span>
              </div>
              <div className="mood-overview-summary">
                <div>
                  <span>Most common mood</span>
                  <strong>{insights.mostCommonMood}</strong>
                </div>
                <div>
                  <span>Total moods recorded</span>
                  <strong>{insights.totalMoods}</strong>
                </div>
              </div>
              <div className="mood-count-list">
                {insights.moodCounts.map((mood, index) => (
                  <div className="mood-count-row" key={mood.label}>
                    <span className={`mood-chart-dot mood-dot-${index}`} />
                    <span className="mood-count-label">{mood.label}</span>
                    <div className="insight-progress-track">
                      <span
                        className={`insight-progress-fill mood-fill-${index}`}
                        style={{ width: `${(mood.count / maxMoodCount) * 100}%` }}
                      />
                    </div>
                    <strong>{mood.count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="insights-panel category-panel" aria-labelledby="categories-title">
              <div className="insights-panel-heading">
                <div>
                  <h2 id="categories-title">Categories</h2>
                  <p>Where your thoughts tend to go.</p>
                </div>
                <span className="insights-panel-icon category-panel-icon"><NotebookPen size={16} /></span>
              </div>
              <div className="category-count-list">
                {insights.categoryCounts.map((category, index) => (
                  <div className="category-count-row" key={category.label}>
                    <div className="category-row-label">
                      <span className={`category-chart-dot category-dot-${index}`} />
                      <span>{category.label}</span>
                      <strong>{category.count}</strong>
                    </div>
                    <div className="insight-progress-track category-track">
                      <span
                        className={`insight-progress-fill category-fill-${index}`}
                        style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="category-chart-note">Entries can appear in more than one category when their label includes multiple topics.</p>
            </section>
          </div>

          <section className="insights-panel entries-time-panel" aria-labelledby="entries-time-title">
            <div className="insights-panel-heading">
              <div>
                <h2 id="entries-time-title">Entries Over Time</h2>
                <p>Your daily entries during the past 14 days.</p>
              </div>
              <span className="insights-panel-icon time-panel-icon"><ChartNoAxesColumnIncreasing size={16} /></span>
            </div>
            <EntriesOverTimeChart days={insights.recentDays} />
          </section>

          <section className="insights-section writing-insights-section" aria-labelledby="writing-insights-title">
            <div className="insights-section-heading">
              <div>
                <h2 id="writing-insights-title">Writing Insights</h2>
                <p>The words and rhythms that make your diary yours.</p>
              </div>
            </div>
            <div className="writing-insights-grid">
              <article className="writing-insight-card">
                <span className="writing-insight-label">Total words written</span>
                <strong>{insights.totalWords.toLocaleString()}</strong>
                <span className="writing-insight-detail">Across all your entries</span>
              </article>
              <article className="writing-insight-card">
                <span className="writing-insight-label">Average words per entry</span>
                <strong>{insights.averageWords.toLocaleString()}</strong>
                <span className="writing-insight-detail">A little adds up</span>
              </article>
              <article className="writing-insight-card">
                <span className="writing-insight-label">Longest entry</span>
                <strong>{insights.longestEntry.words.toLocaleString()} <small>words</small></strong>
                <span className="writing-insight-detail">{insights.longestEntry.title || 'No writing yet'}</span>
              </article>
              <article className="writing-insight-card">
                <span className="writing-insight-label">Most active journaling day</span>
                <strong>{insights.mostActiveDay}</strong>
                <span className="writing-insight-detail">
                  {insights.mostActiveDay === '—'
                    ? 'No dated entries yet'
                    : `${insights.mostActiveDay} is your most active day`}
                </span>
              </article>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

const moodValues = {
  Great: 5,
  Good: 4,
  Okay: 3,
  Tired: 2,
  Sad: 1,
  Stressed: 1,
}

const moodEmojis = {
  Great: '🤩',
  Good: '🙂',
  Okay: '😐',
  Tired: '😴',
  Sad: '🙁',
  Stressed: '😣',
}

function getMoodTrend(entries) {
  const datedMoods = entries
    .filter((entry) => trackedMoods.includes(entry.mood))
    .map((entry) => ({
      entry,
      date: parseEntryDate(entry.date),
      timestamp: Date.parse(entry.createdAt ?? entry.updatedAt ?? ''),
    }))
    .filter(({ date }) => date !== null)
    .sort((first, second) => {
      const dateDifference = first.date.getTime() - second.date.getTime()
      return dateDifference || first.timestamp - second.timestamp
    })

  if (datedMoods.length < 6) {
    return { label: 'Not enough data yet.', detail: 'Add more mood entries to reveal a trend.' }
  }

  const earlierEntries = datedMoods.slice(-10, -5)
  const recentEntries = datedMoods.slice(-5)
  if (earlierEntries.length < 3 || recentEntries.length < 3) {
    return { label: 'Not enough data yet.', detail: 'Add more mood entries to reveal a trend.' }
  }

  const averageMood = (group) =>
    group.reduce((total, { entry }) => total + moodValues[entry.mood], 0) / group.length
  const difference = averageMood(recentEntries) - averageMood(earlierEntries)

  if (difference >= 0.4) {
    return { label: 'Improving', detail: 'Your recent mood entries are trending brighter.' }
  }
  if (difference <= -0.4) {
    return { label: 'Declining', detail: 'Your recent mood entries have shifted downward.' }
  }
  return { label: 'Stable', detail: 'Your mood has been fairly consistent lately.' }
}

function MoodTrackerPage({ onNewEntry }) {
  const [selectedMood, setSelectedMood] = useState('All')
  const [entryState, setEntryState] = useState(() => {
    try {
      return { entries: getEntries(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { entries: [], error: `Could not load mood history: ${message}` }
    }
  })

  useEffect(() => {
    const refreshEntries = () => {
      try {
        setEntryState({ entries: getEntries(), error: '' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unknown storage error occurred.'
        setEntryState((current) => ({
          ...current,
          error: `Could not load mood history: ${message}`,
        }))
      }
    }
    window.addEventListener('storage', refreshEntries)
    return () => window.removeEventListener('storage', refreshEntries)
  }, [])

  const entries = entryState.entries
  const moodEntries = entries.filter((entry) => trackedMoods.includes(entry.mood))
  const moodCounts = trackedMoods.map((mood) => ({
    label: mood,
    count: moodEntries.filter((entry) => entry.mood === mood).length,
  }))
  const totalMoodEntries = moodEntries.length
  const positiveMoodCount = moodEntries.filter(
    (entry) => entry.mood === 'Great' || entry.mood === 'Good',
  ).length
  const negativeMoodCount = moodEntries.filter(
    (entry) => entry.mood === 'Tired' || entry.mood === 'Sad' || entry.mood === 'Stressed',
  ).length
  const mostCommonMood = moodCounts.reduce(
    (mostCommon, mood) => mood.count > mostCommon.count ? mood : mostCommon,
    { label: '—', count: 0 },
  )
  const moodTrend = getMoodTrend(entries)
  const moodTrendClass = moodTrend.label.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')
  const maxMoodCount = Math.max(1, ...moodCounts.map((mood) => mood.count))
  const filteredHistory = [...moodEntries]
    .filter((entry) => selectedMood === 'All' || entry.mood === selectedMood)
    .sort((first, second) => {
      const firstDate = parseEntryDate(first.date)
      const secondDate = parseEntryDate(second.date)
      const dateDifference = (secondDate?.getTime() ?? 0) - (firstDate?.getTime() ?? 0)
      if (dateDifference !== 0) return dateDifference
      return (second.createdAt ?? second.updatedAt ?? '')
        .localeCompare(first.createdAt ?? first.updatedAt ?? '')
    })

  return (
    <div className="mood-tracker-page">
      <section className="mood-tracker-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Mood Tracker</h1>
          <p>Make room for the feelings that shape each day.</p>
        </div>
        {entries.length > 0 && (
          <button className="entries-new-button" type="button" onClick={() => onNewEntry()}>
            <Plus size={16} />
            New Entry
          </button>
        )}
      </section>

      {entryState.error && <p className="entries-error" role="alert">{entryState.error}</p>}

      {entries.length === 0 ? (
        <section className="mood-tracker-empty-state">
          <span className="mood-tracker-empty-icon"><Heart size={23} /></span>
          <h2>Your mood journey starts here.</h2>
          <p>Add diary entries with moods to see your mood history and trends.</p>
          <button className="entries-new-button" type="button" onClick={() => onNewEntry()}>
            <Plus size={16} />
            New Entry
          </button>
        </section>
      ) : (
        <>
          <section className="mood-overview-section" aria-labelledby="mood-overview-heading">
            <div className="mood-section-heading">
              <div>
                <h2 id="mood-overview-heading">Mood Overview</h2>
                <p>A gentle snapshot from your mood check-ins.</p>
              </div>
            </div>
            <div className="mood-overview-grid">
              <article className="mood-overview-card">
                <span className="mood-overview-icon overview-violet"><Sparkles size={17} /></span>
                <span className="mood-overview-label">Most Common Mood</span>
                <strong>{mostCommonMood.count > 0 ? `${moodEmojis[mostCommonMood.label]} ${mostCommonMood.label}` : '—'}</strong>
                <span className="mood-overview-detail">
                  {mostCommonMood.count > 0
                    ? `${mostCommonMood.count} ${mostCommonMood.count === 1 ? 'entry' : 'entries'}`
                    : 'No moods recorded'}
                </span>
              </article>
              <article className="mood-overview-card">
                <span className="mood-overview-icon overview-blue"><NotebookPen size={17} /></span>
                <span className="mood-overview-label">Total Mood Entries</span>
                <strong>{totalMoodEntries}</strong>
                <span className="mood-overview-detail">Entries with a selected mood</span>
              </article>
              <article className="mood-overview-card">
                <span className="mood-overview-icon overview-green"><Heart size={17} /></span>
                <span className="mood-overview-label">Positive Mood Count</span>
                <strong>{positiveMoodCount}</strong>
                <span className="mood-overview-detail">Great and Good check-ins</span>
              </article>
              <article className="mood-overview-card">
                <span className="mood-overview-icon overview-pink"><Heart size={17} /></span>
                <span className="mood-overview-label">Negative Mood Count</span>
                <strong>{negativeMoodCount}</strong>
                <span className="mood-overview-detail">Sad and Stressed check-ins</span>
              </article>
              <article className={`mood-overview-card mood-trend-card trend-${moodTrendClass}`}>
                <span className="mood-overview-icon overview-amber"><ChartNoAxesColumnIncreasing size={17} /></span>
                <span className="mood-overview-label">Current Mood Trend</span>
                <strong>{moodTrend.label}</strong>
                <span className="mood-overview-detail">{moodTrend.detail}</span>
              </article>
            </div>
          </section>

          <div className="mood-tracker-panels">
            <section className="mood-tracker-panel mood-distribution-panel" aria-labelledby="mood-distribution-title">
              <div className="mood-panel-heading">
                <div>
                  <h2 id="mood-distribution-title">Mood Distribution</h2>
                  <p>How your mood entries are spread out.</p>
                </div>
                <span className="mood-panel-heading-icon"><ChartNoAxesColumnIncreasing size={16} /></span>
              </div>
              <div className="mood-distribution-list">
                {moodCounts.map((mood) => (
                  <div className="mood-distribution-row" key={mood.label}>
                    <span className={`mood-emoji mood-${mood.label.toLowerCase()}`}>{moodEmojis[mood.label]}</span>
                    <span className="mood-distribution-label">{mood.label}</span>
                    <div className="mood-distribution-track">
                      <span
                        className={`mood-distribution-fill mood-fill-${mood.label.toLowerCase()}`}
                        style={{ width: `${(mood.count / maxMoodCount) * 100}%` }}
                      />
                    </div>
                    <strong>{mood.count}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="mood-tracker-panel mood-trend-panel" aria-labelledby="mood-trend-title">
              <div className="mood-panel-heading">
                <div>
                  <h2 id="mood-trend-title">Mood Trend</h2>
                  <p>Comparing your latest check-ins with the ones before.</p>
                </div>
                <span className="mood-panel-heading-icon trend-heading-icon"><Sparkles size={16} /></span>
              </div>
              <div className="mood-trend-display">
                <span className={`mood-trend-symbol trend-symbol-${moodTrendClass}`}>
                  {moodTrend.label === 'Improving' ? '↗' : moodTrend.label === 'Declining' ? '↘' : moodTrend.label === 'Stable' ? '→' : '·'}
                </span>
                <div>
                  <strong>{moodTrend.label}</strong>
                  <p>{moodTrend.detail}</p>
                </div>
              </div>
              <p className="mood-trend-method">
                {totalMoodEntries >= 6
                  ? 'Based on the five most recent mood entries compared with the five before them.'
                  : 'Not enough data yet.'}
              </p>
            </section>
          </div>

          <section className="mood-history-section" aria-labelledby="mood-history-title">
            <div className="mood-history-heading">
              <div>
                <h2 id="mood-history-title">Mood History</h2>
                <p>Recent entries with a mood check-in.</p>
              </div>
              <label className="mood-history-filter">
                <span className="sr-only">Filter mood history</span>
                <select
                  aria-label="Filter mood history"
                  value={selectedMood}
                  onChange={(event) => setSelectedMood(event.target.value)}
                >
                  {['All', ...trackedMoods].map((mood) => (
                    <option key={mood}>{mood}</option>
                  ))}
                </select>
                <ChevronDown size={15} aria-hidden="true" />
              </label>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="mood-history-list">
                {filteredHistory.map((entry) => (
                  <article className="mood-history-entry" key={entry.id}>
                    <span className={`mood-history-emoji mood-bg-${entry.mood.toLowerCase()}`}>
                      {moodEmojis[entry.mood]}
                    </span>
                    <div className="mood-history-entry-copy">
                      <strong>{entry.title?.trim() || 'Untitled entry'}</strong>
                      <span>{entry.category || 'Uncategorized'}</span>
                    </div>
                    <span className={`mood-history-pill mood-pill-${entry.mood.toLowerCase()}`}>
                      {entry.mood}
                    </span>
                    <time className="mood-history-date" dateTime={parseEntryDate(entry.date)?.toISOString()}>
                      {entry.date || 'Date unavailable'}
                    </time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mood-history-empty">
                <Heart size={18} />
                <span>
                  {totalMoodEntries === 0
                    ? 'No mood check-ins yet.'
                    : `No entries with the ${selectedMood} mood yet.`}
                </span>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

const journalPrompts = [
  'What made you smile today?',
  'What is something you are grateful for?',
  'What challenge did you overcome recently?',
  'What would you like to improve tomorrow?',
  'What is something you learned about yourself today?',
]

function getMoodAnalysis(entries) {
  const moodEntries = entries.filter((entry) => trackedMoods.includes(entry.mood))
  if (moodEntries.length === 0) {
    return 'I need some diary entries before I can analyze your personal patterns.'
  }

  const moodCounts = trackedMoods.map((mood) => ({
    mood,
    count: moodEntries.filter((entry) => entry.mood === mood).length,
  }))
  const mostCommon = moodCounts.reduce(
    (highest, mood) => mood.count > highest.count ? mood : highest,
    { mood: '', count: 0 },
  )
  const positiveCount = moodCounts
    .filter(({ mood }) => mood === 'Great' || mood === 'Good')
    .reduce((total, mood) => total + mood.count, 0)
  const difficultCount = moodCounts
    .filter(({ mood }) => mood === 'Tired' || mood === 'Sad' || mood === 'Stressed')
    .reduce((total, mood) => total + mood.count, 0)
  let pattern = 'Your recorded moods are fairly balanced.'
  if (positiveCount > difficultCount) {
    pattern = 'Your entries lean more positive than difficult lately.'
  } else if (difficultCount > positiveCount) {
    pattern = 'Your entries include more difficult feelings lately; remember to be gentle with yourself.'
  }

  return `Based on your recent diary entries, your mood appears to be most often ${mostCommon.mood} (${mostCommon.count} ${mostCommon.count === 1 ? 'entry' : 'entries'}). ${pattern} This is only a reflection of the moods you chose to record.`
}

function getDiarySummary(entries) {
  if (entries.length === 0) {
    return 'I need some diary entries before I can analyze your personal patterns.'
  }

  const recentEntries = [...entries]
    .sort((first, second) =>
      (second.updatedAt ?? second.createdAt ?? '')
        .localeCompare(first.updatedAt ?? first.createdAt ?? ''),
    )
    .slice(0, 3)
  const summaries = recentEntries.map((entry) => {
    const excerpt = (entry.content ?? '').trim().replace(/\s+/g, ' ')
    const shortenedExcerpt = excerpt.length > 120
      ? `${excerpt.slice(0, 117)}...`
      : excerpt
    return shortenedExcerpt
      ? `“${entry.title?.trim() || 'Untitled entry'}” reflects on ${shortenedExcerpt}`
      : `“${entry.title?.trim() || 'Untitled entry'}” is a saved reflection without written content yet`
  })

  return `Based on your recent entries, here is a short summary: ${summaries.join('; ')}.`
}

function getRecentPatterns(entries) {
  if (entries.length === 0) {
    return 'I need some diary entries before I can analyze your personal patterns.'
  }

  const insights = getInsightData(entries)
  const categoryCounts = trackedCategories.map((category) => ({
    category,
    count: entries.filter((entry) =>
      getEntryCategoryGroups(entry.category).includes(category),
    ).length,
  }))
  const mostUsedCategory = categoryCounts.reduce(
    (mostUsed, category) => category.count > mostUsed.count ? category : mostUsed,
    { category: '', count: 0 },
  )
  const averageWords = Math.round(
    entries.reduce((total, entry) => total + countWords(entry.content ?? ''), 0) / entries.length,
  )
  const recentEntries = insights.recentDays.reduce((total, day) => total + day.count, 0)

  return `Here are a few patterns in your diary: your most common mood is ${insights.mostCommonMood}; your most-used category is ${mostUsedCategory.category} (${mostUsedCategory.count} ${mostUsedCategory.count === 1 ? 'entry' : 'entries'}); your current writing streak is ${insights.streak} ${insights.streak === 1 ? 'day' : 'days'}; you have ${recentEntries} ${recentEntries === 1 ? 'entry' : 'entries'} in the past 14 days; and your entries average ${averageWords} ${averageWords === 1 ? 'word' : 'words'}.`
}

function getWritingSuggestion(text) {
  const cleanedText = text.trim().replace(/\s+/g, ' ')
  if (!cleanedText) {
    return 'Please paste a sentence or paragraph you would like a writing suggestion for.'
  }

  let suggestion = cleanedText
    .replace(/\bvery good\b/gi, 'meaningful')
    .replace(/\breally\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
  if (!/[.!?]$/.test(suggestion)) suggestion += '.'

  return `AI-style writing suggestion (a simple local edit):\n${suggestion}\n\nI kept your original meaning and lightly polished the phrasing.`
}

function getAssistantResponse(message, entries, onPrompt) {
  const normalizedMessage = message.toLowerCase()

  if (/\b(improve|edit|polish|rewrite)\b/.test(normalizedMessage)
    && /\b(writing|sentence|text|paragraph|words?)\b/.test(normalizedMessage)) {
    onPrompt()
    return 'Paste the sentence or paragraph you would like help with, and I’ll offer a simple AI-style writing suggestion right here.'
  }
  if (/\b(prompt|prompts|journal prompt|writing prompt)\b/.test(normalizedMessage)) {
    return `Here is a reflection prompt: ${journalPrompts[Math.floor(Math.random() * journalPrompts.length)]}`
  }
  if (/\b(mood|feeling|feelings)\b/.test(normalizedMessage)) {
    return getMoodAnalysis(entries)
  }
  if (/\b(summar(y|ize)|summary)\b/.test(normalizedMessage)) {
    return getDiarySummary(entries)
  }
  if (/\b(pattern|patterns|streak|category|categories|recent entries)\b/.test(normalizedMessage)) {
    return getRecentPatterns(entries)
  }
  return 'I can help you reflect on your diary, analyze your mood, summarize entries, or give you journaling prompts.'
}

function AssistantMessage({ message, onNewEntry }) {
  return (
    <article className={`assistant-chat-message message-${message.role}`}>
      {message.role === 'assistant' && (
        <span className="chat-message-avatar"><Sparkles size={15} /></span>
      )}
      <div className="chat-message-body">
        <span className="chat-message-author">{message.role === 'assistant' ? 'Diary Companion' : 'You'}</span>
        <p>{message.text}</p>
        {message.showNewEntry && (
          <button className="chat-new-entry-link" type="button" onClick={onNewEntry}>
            <Plus size={14} />
            New Entry
          </button>
        )}
      </div>
    </article>
  )
}

function AIAssistantPage({ onNewEntry, profileName = 'Hansini' }) {
  const [entryState, setEntryState] = useState(() => {
    try {
      return { entries: getEntries(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { entries: [], error: `Could not load diary entries: ${message}` }
    }
  })
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hi ${profileName}! I’m your personal journaling companion. Ask me about your diary, explore a feeling, or find a gentle prompt to get started.`,
    },
  ])
  const [draftMessage, setDraftMessage] = useState('')
  const [awaitingWriting, setAwaitingWriting] = useState(false)
  const conversationRef = useRef(null)
  const messageInputRef = useRef(null)

  useEffect(() => {
    const refreshEntries = () => {
      try {
        setEntryState({ entries: getEntries(), error: '' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unknown storage error occurred.'
        setEntryState((current) => ({
          ...current,
          error: `Could not load diary entries: ${message}`,
        }))
      }
    }
    window.addEventListener('storage', refreshEntries)
    return () => window.removeEventListener('storage', refreshEntries)
  }, [])

  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [messages])

  useEffect(() => {
    if (awaitingWriting) messageInputRef.current?.focus()
  }, [awaitingWriting])

  const addMessage = (role, text, options = {}) => {
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, role, text, ...options },
    ])
  }

  const sendMessage = (message, { bypassWriting = false } = {}) => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    addMessage('user', trimmedMessage)
    setDraftMessage('')

    if (awaitingWriting && !bypassWriting) {
      setAwaitingWriting(false)
      addMessage('assistant', getWritingSuggestion(trimmedMessage))
      return
    }
    if (bypassWriting) setAwaitingWriting(false)

    let writingRequested = false
    const response = getAssistantResponse(trimmedMessage, entryState.entries, () => {
      writingRequested = true
    })
    const needsDiaryEntries = entryState.entries.length === 0
      && /\b(mood|feeling|feelings|summar(y|ize)|summary|pattern|patterns|streak|category|categories|recent entries)\b/i
        .test(trimmedMessage)

    if (writingRequested) setAwaitingWriting(true)
    addMessage(
      'assistant',
      response,
      needsDiaryEntries ? { showNewEntry: true } : {},
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(draftMessage)
  }

  const quickActions = [
    { label: 'Analyze My Mood', icon: Heart, request: 'Analyze my mood' },
    { label: 'Summarize My Entries', icon: NotebookPen, request: 'Summarize my entries' },
    { label: 'Give Me a Journal Prompt', icon: Lightbulb, request: 'Give me a journal prompt' },
    { label: 'Improve My Writing', icon: WandSparkles, request: 'Improve my writing' },
    { label: 'Show My Recent Patterns', icon: ChartNoAxesColumnIncreasing, request: 'Show my recent patterns' },
  ]

  return (
    <div className="assistant-page">
      <section className="assistant-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>AI Assistant</h1>
          <p>Your personal journaling companion.</p>
        </div>
        <span className="assistant-ready-badge">
          <span />
          AI Assistant Ready
        </span>
      </section>

      {entryState.error && <p className="entries-error" role="alert">{entryState.error}</p>}

      <div className="assistant-workspace">
        <section className="assistant-chat-card" aria-label="Chat with your journaling companion">
          <div className="assistant-chat-card-heading">
            <span className="assistant-chat-heading-icon"><BrainCircuit size={17} /></span>
            <div>
              <h2>Your conversation</h2>
              <p>Private to this session · Diary data stays on this device</p>
            </div>
            <button
              className="clear-chat-button"
              type="button"
              onClick={() => {
                setMessages([{
                  id: `welcome-${Date.now()}`,
                  role: 'assistant',
                  text: `Hi ${profileName}! I’m your personal journaling companion. Ask me about your diary, explore a feeling, or find a gentle prompt to get started.`,
                }])
                setAwaitingWriting(false)
              }}
            >
              <RotateCcw size={13} />
              Clear Chat
            </button>
          </div>

          <div className="assistant-conversation" ref={conversationRef} aria-live="polite">
            {messages.map((message) => (
              <AssistantMessage
                key={message.id}
                message={message}
                onNewEntry={onNewEntry}
              />
            ))}
          </div>

          <form className="assistant-composer" onSubmit={handleSubmit}>
            <input
              ref={messageInputRef}
              type="text"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder={awaitingWriting ? 'Paste your writing here...' : 'Ask me anything about your journaling...'}
              aria-label="Message the AI Assistant"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draftMessage.trim()}
            >
              <Send size={16} />
            </button>
          </form>
          <p className="assistant-local-note">
            <span /> Your messages and diary data never leave this device.
          </p>
        </section>

        <aside className="assistant-quick-panel">
          <div className="assistant-quick-heading">
            <span className="assistant-quick-icon"><Sparkles size={16} /></span>
            <div>
              <h2>Quick Actions</h2>
              <p>A little help, one tap away.</p>
            </div>
          </div>
          <div className="assistant-quick-actions">
            {quickActions.map(({ label, icon: Icon, request }) => (
              <button
                className="assistant-quick-action"
                type="button"
                key={label}
                onClick={() => sendMessage(request, { bypassWriting: true })}
              >
                <span><Icon size={15} /></span>
                {label}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          {entryState.entries.length === 0 && (
            <div className="assistant-empty-data">
              <span><Lightbulb size={15} /></span>
              <p>Your diary is empty for now. I can still help with prompts and writing suggestions.</p>
              <button type="button" onClick={onNewEntry}>
                <Plus size={13} />
                New Entry
              </button>
            </div>
          )}
          <div className="assistant-disclaimer">
            <Sparkles size={13} />
            <span>Thoughtful suggestions, not professional advice.</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CalendarPage({ onNewEntry }) {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateKey(today))
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [entryState, setEntryState] = useState(() => {
    try {
      return { entries: getEntries(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { entries: [], error: `Could not load diary entries: ${message}` }
    }
  })

  useEffect(() => {
    const refreshEntries = () => {
      try {
        setEntryState({ entries: getEntries(), error: '' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unknown storage error occurred.'
        setEntryState((current) => ({
          ...current,
          error: `Could not load diary entries: ${message}`,
        }))
      }
    }
    window.addEventListener('storage', refreshEntries)
    return () => window.removeEventListener('storage', refreshEntries)
  }, [])

  const changeMonth = (offset) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    )
    setVisibleMonth(nextMonth)
    setSelectedDate(getLocalDateKey(nextMonth))
  }

  const goToToday = () => {
    const currentDate = new Date()
    setVisibleMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
    setSelectedDate(getLocalDateKey(currentDate))
  }

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate()
  const firstWeekday = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  ).getDay()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      index - firstWeekday + 1,
    )
    const dateKey = getLocalDateKey(date)
    const isCurrentMonth = date.getMonth() === visibleMonth.getMonth()
    const entries = entryState.entries.filter((entry) => {
      const entryDate = parseEntryDate(entry.date)
      return entryDate !== null && getLocalDateKey(entryDate) === dateKey
    })

    return { date, dateKey, isCurrentMonth, entries }
  })
  const selectedDay = parseEntryDate(selectedDate)
  const selectedEntries = entryState.entries
    .filter((entry) => {
      const entryDate = parseEntryDate(entry.date)
      return entryDate !== null && getLocalDateKey(entryDate) === selectedDate
    })
    .sort((first, second) => (second.time ?? '').localeCompare(first.time ?? ''))
  const monthTitle = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)

  return (
    <div className="calendar-page">
      <section className="calendar-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Calendar</h1>
          <p>See your journaling journey unfold, one day at a time.</p>
        </div>
        <button
          className="entries-new-button"
          type="button"
          onClick={() => onNewEntry(selectedDate)}
        >
          <Plus size={16} />
          New Entry
        </button>
      </section>

      {entryState.error && <p className="entries-error" role="alert">{entryState.error}</p>}

      <section className="calendar-card" aria-label="Monthly diary calendar">
        <div className="calendar-header">
          <div>
            <h2>{monthTitle}</h2>
            <p>Choose a day to revisit your entries</p>
          </div>
          <div className="calendar-controls">
            <button type="button" onClick={goToToday}>Today</button>
            <button
              className="calendar-arrow"
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="calendar-arrow"
              type="button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map(({ date, dateKey, isCurrentMonth, entries }) => {
            const isToday = dateKey === getLocalDateKey(new Date())
            const isSelected = dateKey === selectedDate

            return (
              <button
                className={[
                  'calendar-day',
                  isCurrentMonth ? '' : 'is-outside-month',
                  isToday ? 'is-today' : '',
                  isSelected ? 'is-selected' : '',
                  entries.length > 0 ? 'has-entries' : '',
                ].filter(Boolean).join(' ')}
                type="button"
                key={dateKey}
                aria-label={`${formatEntryDate(date)}${entries.length ? `, ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` : ''}`}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedDate(dateKey)
                  if (!isCurrentMonth) {
                    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                  }
                }}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {entries.length > 0 && (
                  <span className="calendar-entry-indicators" aria-hidden="true">
                    {entries.slice(0, 3).map((entry) => (
                      <span className="calendar-entry-dot" key={entry.id} />
                    ))}
                    {entries.length > 3 && <span className="calendar-entry-more">+{entries.length - 3}</span>}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="calendar-legend">
          <span><span className="legend-today" /> Today</span>
          <span><span className="legend-entry" /> Has entries</span>
        </div>
      </section>

      <section className="calendar-day-entries" aria-labelledby="selected-day-heading">
        <div className="calendar-day-entries-heading">
          <div>
            <span className="calendar-selected-label">SELECTED DAY</span>
            <h2 id="selected-day-heading">
              {selectedDay ? formatEntryDate(selectedDay) : 'Selected day'}
            </h2>
          </div>
          <span className="calendar-entry-count">
            {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {selectedEntries.length > 0 ? (
          <div className="calendar-entry-list">
            {selectedEntries.map((entry) => (
              <button
                className="calendar-entry-row"
                type="button"
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
              >
                <span className="calendar-entry-row-icon"><NotebookPen size={16} /></span>
                <span className="calendar-entry-row-copy">
                  <strong>{entry.title || 'Untitled entry'}</strong>
                  <span>{entry.category || 'Uncategorized'}{entry.mood ? ` · ${entry.mood}` : ''}</span>
                </span>
                <span className="calendar-entry-row-time">{entry.time || 'Time unavailable'}</span>
                <span className={`entry-status status-${(entry.status ?? 'Draft').toLowerCase()}`}>
                  {entry.status || 'Draft'}
                </span>
                <ChevronRight className="calendar-entry-chevron" size={16} />
              </button>
            ))}
          </div>
        ) : (
          <div className="calendar-day-empty">
            <span className="calendar-empty-icon"><CalendarDays size={18} /></span>
            <div>
              <strong>No entries for this day</strong>
              <p>Make a note of a moment worth remembering.</p>
            </div>
            <button type="button" onClick={() => onNewEntry(selectedDate)}>
              <Plus size={14} />
              New Entry
            </button>
          </div>
        )}
      </section>

      {selectedEntry && (
        <div
          className="entry-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedEntry(null)
          }}
        >
          <section
            className="entry-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-entry-detail-title"
          >
            <div className="entry-detail-top">
              <span className="saved-entry-category">
                {selectedEntry.category || 'Uncategorized'}
              </span>
              <span className={`entry-status status-${(selectedEntry.status ?? 'Draft').toLowerCase()}`}>
                {selectedEntry.status || 'Draft'}
              </span>
            </div>
            <h2 id="calendar-entry-detail-title">{selectedEntry.title || 'Untitled entry'}</h2>
            <div className="entry-detail-meta">
              <span>{selectedEntry.date || 'Date unavailable'}</span>
              <span>·</span>
              <span>{selectedEntry.time || 'Time unavailable'}</span>
              <span className="entry-detail-mood">{selectedEntry.mood || 'No mood selected'}</span>
            </div>
            <p className="entry-detail-content">
              {selectedEntry.content || 'No writing in this entry yet.'}
            </p>
            <div className="entry-detail-actions">
              <button
                className="entry-close-button"
                type="button"
                onClick={() => setSelectedEntry(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function NewEntryPage({ dateTime, entryToEdit, selectedDate, preferences }) {
  const [title, setTitle] = useState(() => entryToEdit?.title ?? '')
  const [category, setCategory] = useState(
    () => entryToEdit?.category ?? preferences.defaultCategory,
  )
  const [content, setContent] = useState(() => entryToEdit?.content ?? '')
  const [selectedMood, setSelectedMood] = useState(() => entryToEdit?.mood ?? preferences.defaultMood)
  const [assistantTab, setAssistantTab] = useState('Suggestions')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('success')
  const [savedEntryId, setSavedEntryId] = useState(() => entryToEdit?.id ?? null)
  const textareaRef = useRef(null)
  const newEntryDate = selectedDate ? parseEntryDate(selectedDate) : null
  const entryDateTime = entryToEdit
    ? { date: entryToEdit.date, time: entryToEdit.time }
    : newEntryDate
      ? { date: formatEntryDate(newEntryDate), time: dateTime.time }
      : dateTime

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const suggestions =
    assistantTab === 'Suggestions'
      ? [
          {
            title: 'Start with a moment',
            text: 'What is one small moment from today that you want to remember?',
            icon: Sparkles,
          },
          {
            title: 'Explore a feeling',
            text: 'Try describing what you felt, not just what happened.',
            icon: Heart,
          },
          {
            title: 'Look for a bright spot',
            text: 'Was there something that made today a little easier?',
            icon: Lightbulb,
          },
        ]
      : [
          {
            title: 'Your writing rhythm',
            text: 'A few honest sentences are a lovely place to begin.',
            icon: ChartNoAxesColumnIncreasing,
          },
          {
            title: 'Mood check-in',
            text: selectedMood
              ? `You marked today as ${selectedMood.toLowerCase()}. What shaped that feeling?`
              : 'Choose a mood to add a little context to this entry.',
            icon: Heart,
          },
          {
            title: 'Gentle reminder',
            text: 'There is no right way to journal. Write what feels true.',
            icon: Sparkles,
          },
        ]

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const selectedText = content.slice(selectionStart, selectionEnd)
    const nextContent =
      content.slice(0, selectionStart) +
      prefix +
      selectedText +
      suffix +
      content.slice(selectionEnd)

    setContent(nextContent)
    requestAnimationFrame(() => {
      textarea.focus()
      const selectionPosition = selectionStart + prefix.length
      textarea.setSelectionRange(
        selectionPosition,
        selectionPosition + selectedText.length,
      )
    })
  }

  const showFeedback = (message, type = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
  }

  const persistEntry = (status) => {
    const isUpdating = Boolean(savedEntryId)
    const entry = {
      title: title.trim(),
      content,
      date: entryDateTime.date,
      time: entryDateTime.time,
      category,
      mood: selectedMood,
      status,
    }

    try {
      const savedEntry = savedEntryId
        ? updateEntry(savedEntryId, entry)
        : saveEntry(entry)

      setSavedEntryId(savedEntry.id)
      showFeedback(
        isUpdating
          ? status === 'Draft'
            ? 'Draft updated successfully.'
            : 'Entry updated successfully.'
          : status === 'Draft'
            ? 'Draft saved successfully.'
            : 'Entry published successfully.',
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      showFeedback(`Could not save your entry: ${message}`, 'error')
    }
  }

  return (
    <div className="new-entry-layout">
      <main className="entry-editor">
        <div className="entry-page-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
            <h1>{entryToEdit ? 'Edit Diary Entry' : 'New Diary Entry'}</h1>
            <p>A quiet moment to gather your thoughts.</p>
          </div>
          <div className="entry-date-badge">
            <CalendarDays size={15} />
            <span>{entryDateTime.date}</span>
            <span className="entry-date-separator" />
            <Clock3 size={14} />
            <span>{entryDateTime.time}</span>
          </div>
        </div>

        <section className="editor-card" aria-label="Diary entry editor">
          <label className="field-label" htmlFor="entry-category">CATEGORY</label>
          <div className="category-select-wrap">
            <select
              className="category-select"
              id="entry-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Personal Reflection</option>
              <option>Gratitude</option>
              <option>Personal Growth</option>
              <option>Work &amp; Study</option>
              <option>Memories</option>
              {settingCategories.map((defaultCategory) => (
                <option key={defaultCategory}>{defaultCategory}</option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>

          <label className="field-label title-label" htmlFor="entry-title">TITLE</label>
          <input
            className="title-input"
            id="entry-title"
            type="text"
            placeholder="Give your entry a title..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="writing-field-heading">
            <label className="field-label" htmlFor="entry-content">YOUR THOUGHTS</label>
            <span className="writing-hint">No rush. This space is yours.</span>
          </div>
          <div className="formatting-toolbar" role="toolbar" aria-label="Text formatting">
            <button type="button" aria-label="Bold" title="Bold" onClick={() => insertFormatting('**', '**')}>
              <Bold size={16} />
            </button>
            <button type="button" aria-label="Italic" title="Italic" onClick={() => insertFormatting('_', '_')}>
              <Italic size={16} />
            </button>
            <button type="button" aria-label="Underline" title="Underline" onClick={() => insertFormatting('<u>', '</u>')}>
              <Underline size={16} />
            </button>
            <span className="toolbar-divider" />
            <button type="button" aria-label="Bullet list" title="Bullet list" onClick={() => insertFormatting('\n- ')}>
              <List size={17} />
            </button>
            <button type="button" aria-label="Quote" title="Quote" onClick={() => insertFormatting('\n> ')}>
              <Quote size={16} />
            </button>
          </div>
          <textarea
            className="diary-textarea"
            id="entry-content"
            ref={textareaRef}
            placeholder="Start writing... What’s on your mind today?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="editor-meta">
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span className="private-note"><span /> Only you can see this</span>
          </div>

          <div className="editor-separator" />
          <fieldset className="mood-field">
            <legend className="field-label">HOW ARE YOU FEELING?</legend>
            <div className="mood-options">
              {[
                { label: 'Great', emoji: '🤩' },
                { label: 'Good', emoji: '🙂' },
                { label: 'Okay', emoji: '😐' },
                { label: 'Tired', emoji: '😴' },
                { label: 'Sad', emoji: '🙁' },
                { label: 'Stressed', emoji: '😣' },
              ].map(({ label, emoji }) => (
                <button
                  className={`mood-option${selectedMood === label ? ' is-selected' : ''}`}
                  key={label}
                  type="button"
                  aria-pressed={selectedMood === label}
                  onClick={() => setSelectedMood(label)}
                >
                  <span>{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <div className="editor-actions">
          <span className="draft-note"><Check size={14} /> Your entry is private until you publish</span>
          <div className="editor-action-buttons">
            <button
              className="save-draft-button"
              type="button"
              onClick={() => persistEntry('Draft')}
            >
              Save Draft
            </button>
            <button
              className="publish-button"
              type="button"
              onClick={() => persistEntry('Published')}
            >
              <span>Publish</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        {feedback && (
          <p
            className={`editor-feedback editor-feedback-${feedbackType}`}
            role={feedbackType === 'error' ? 'alert' : 'status'}
          >
            {feedback}
          </p>
        )}
      </main>

      <aside className="assistant-panel">
        <div className="assistant-panel-header">
          <div className="assistant-title-icon"><Sparkles size={17} /></div>
          <div>
            <h2>AI Assistant</h2>
            <p>A gentle companion for your thoughts</p>
          </div>
          <span className="assistant-online-dot" aria-label="Preview mode" />
        </div>

        <div className="assistant-tabs" role="tablist" aria-label="AI assistant content">
          {['Suggestions', 'Insights'].map((tab) => (
            <button
              className={`assistant-tab${assistantTab === tab ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={assistantTab === tab}
              key={tab}
              onClick={() => setAssistantTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="suggestion-list">
          {suggestions.map(({ title: suggestionTitle, text, icon: Icon }) => (
            <article className="suggestion-card" key={suggestionTitle}>
              <span className="suggestion-icon"><Icon size={15} /></span>
              <div>
                <h3>{suggestionTitle}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="writing-helper">
          <div className="writing-helper-heading">
            <span className="helper-icon"><Lightbulb size={16} /></span>
            <h3>Writing helper</h3>
          </div>
          <p>Feeling stuck? Try one of these gentle prompts.</p>
          <button
            className="writing-prompt"
            type="button"
            onClick={() => setContent((current) =>
              `${current}${current ? '\n\n' : ''}One thing I want to remember about today is...`,
            )}
          >
            <span>“</span>One thing I want to remember about today is...
          </button>
          <button
            className="writing-prompt"
            type="button"
            onClick={() => setContent((current) =>
              `${current}${current ? '\n\n' : ''}Right now, I’m feeling...`,
            )}
          >
            <span>“</span>Right now, I&apos;m feeling...
          </button>
        </section>

        <div className="assistant-footer">
          <div className="assistant-preview-note">
            <span><Sparkles size={13} /> AI writing tools are a preview</span>
            <span>Thoughtful, never intrusive.</span>
          </div>
          <button
            className="improve-button"
            type="button"
            onClick={() => showFeedback(
              'AI improvements are a preview and are not connected yet.',
              'info',
            )}
          >
            <WandSparkles size={16} />
            Improve with AI
          </button>
        </div>
      </aside>
    </div>
  )
}

const emptyGoalForm = {
  title: '',
  description: '',
  target: '',
  unit: '',
  targetDate: '',
}

function getGoalDateLabel(value) {
  if (!value) return 'No target date'
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return 'Invalid target date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function GoalStatCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="goal-stat-card">
      <span className={`goal-stat-icon goal-stat-${tone}`}><Icon size={16} /></span>
      <span className="goal-stat-label">{label}</span>
      <strong>{value}</strong>
      <span className="goal-stat-detail">{detail}</span>
    </article>
  )
}

function GoalForm({ goal, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(() => goal
    ? {
        title: goal.title,
        description: goal.description,
        target: String(goal.target),
        unit: goal.unit,
        targetDate: goal.targetDate,
      }
    : emptyGoalForm)
  const [formError, setFormError] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const target = Number(form.target)
    if (!form.title.trim()) {
      setFormError('Add a title for your goal.')
      return
    }
    if (!Number.isFinite(target) || target <= 0) {
      setFormError('Enter a target number greater than zero.')
      return
    }
    if (!form.unit.trim()) {
      setFormError('Add a unit so your progress is easy to understand.')
      return
    }
    setFormError('')
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      target,
      unit: form.unit.trim(),
      targetDate: form.targetDate,
    })
  }

  return (
    <form className="goal-form-panel" onSubmit={handleSubmit}>
      <div className="goal-form-heading">
        <div>
          <span className="goal-form-kicker">{goal ? 'UPDATE YOUR INTENTION' : 'MAKE A LITTLE PLAN'}</span>
          <h2>{goal ? 'Edit goal' : 'Create a goal'}</h2>
          <p>Choose a small, meaningful target to work toward.</p>
        </div>
        <button className="goal-form-close" type="button" onClick={onCancel} aria-label="Close goal form">
          <ChevronDown size={17} />
        </button>
      </div>
      <div className="goal-form-fields">
        <label className="goal-form-field goal-form-field-wide">
          <span>Goal title</span>
          <input
            autoFocus
            maxLength={100}
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="e.g. Write 5 diary entries"
            required
          />
        </label>
        <label className="goal-form-field goal-form-field-wide">
          <span>Description <small>Optional</small></span>
          <textarea
            rows={2}
            maxLength={280}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="What makes this goal important to you?"
          />
        </label>
        <label className="goal-form-field">
          <span>Target number</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.target}
            onChange={(event) => updateField('target', event.target.value)}
            placeholder="5"
            required
          />
        </label>
        <label className="goal-form-field">
          <span>Unit / type</span>
          <input
            maxLength={40}
            value={form.unit}
            onChange={(event) => updateField('unit', event.target.value)}
            placeholder="entries"
            required
          />
        </label>
        <label className="goal-form-field">
          <span>Target date <small>Optional</small></span>
          <input
            type="date"
            value={form.targetDate}
            onChange={(event) => updateField('targetDate', event.target.value)}
          />
        </label>
      </div>
      {formError && <p className="goal-form-error" role="alert">{formError}</p>}
      <div className="goal-form-actions">
        <button type="button" className="goal-secondary-button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="goal-primary-button" disabled={isSaving}>
          {isSaving ? 'Saving…' : goal ? 'Save changes' : 'Save goal'}
        </button>
      </div>
    </form>
  )
}

function GoalsPage() {
  const [goalState, setGoalState] = useState(() => {
    try {
      return { goals: getGoals(), loadError: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { goals: [], loadError: `Could not load goals: ${message}` }
    }
  })
  const { goals, loadError } = goalState
  const setGoals = (update) => {
    setGoalState((current) => ({
      ...current,
      goals: typeof update === 'function' ? update(current.goals) : update,
    }))
  }
  const setLoadError = (error) => {
    setGoalState((current) => ({ ...current, loadError: error }))
  }
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingGoal, setEditingGoal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [progressGoalId, setProgressGoalId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const refreshGoals = () => {
    try {
      setGoals(getGoals())
      setLoadError('')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setLoadError(`Could not load goals: ${message}`)
    }
  }

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'ai-smart-diary.goals' && event.key !== null) return
      try {
        setGoalState({ goals: getGoals(), loadError: '' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'An unknown storage error occurred.'
        setGoalState((current) => ({
          ...current,
          loadError: `Could not load goals: ${message}`,
        }))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const activeCount = goals.filter((goal) => goal.status !== 'Completed').length
  const completedCount = goals.length - activeCount
  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((total, goal) => {
        const target = Number(goal.target) || 0
        const progress = Number(goal.currentProgress) || 0
        return total + (target > 0 ? Math.min(100, (progress / target) * 100) : 0)
      }, 0) / goals.length)
    : 0
  const filteredGoals = goals.filter((goal) =>
    filter === 'All' || (filter === 'Completed'
      ? goal.status === 'Completed'
      : goal.status !== 'Completed'),
  )

  const handleSaveGoal = (values) => {
    setIsSaving(true)
    setActionError('')
    setFeedback('')
    try {
      if (editingGoal) {
        updateGoal(editingGoal.id, values)
        setFeedback('Goal updated successfully.')
      } else {
        saveGoal(values)
        setFeedback('Goal created successfully.')
      }
      refreshGoals()
      setShowForm(false)
      setEditingGoal(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setActionError(`Could not save goal: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const changeProgress = (goal, adjustment) => {
    const target = Number(goal.target)
    const currentProgress = Number(goal.currentProgress) || 0
    const nextProgress = Math.min(target, Math.max(0, currentProgress + adjustment))
    try {
      const updated = updateGoal(goal.id, { currentProgress: nextProgress })
      setGoals((current) => current.map((item) => item.id === updated.id ? updated : item))
      setActionError('')
      setFeedback(updated.status === 'Completed'
        ? 'Goal completed — nicely done!'
        : 'Progress updated.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setActionError(`Could not update progress: ${message}`)
    }
  }

  const completeGoal = (goal) => {
    try {
      const updated = updateGoal(goal.id, { currentProgress: goal.target })
      setGoals((current) => current.map((item) => item.id === updated.id ? updated : item))
      setActionError('')
      setFeedback('Goal marked as completed. Congratulations!')
      setProgressGoalId(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setActionError(`Could not complete goal: ${message}`)
    }
  }

  const removeGoal = (goal) => {
    if (!window.confirm(`Delete “${goal.title}”? This action cannot be undone.`)) return
    try {
      deleteGoal(goal.id)
      setGoals((current) => current.filter((item) => item.id !== goal.id))
      setActionError('')
      setFeedback('Goal deleted.')
      if (progressGoalId === goal.id) setProgressGoalId(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setActionError(`Could not delete goal: ${message}`)
    }
  }

  const startCreate = () => {
    setEditingGoal(null)
    setActionError('')
    setFeedback('')
    setShowForm(true)
  }

  const startEdit = (goal) => {
    setEditingGoal(goal)
    setActionError('')
    setFeedback('')
    setShowForm(true)
    setProgressGoalId(null)
  }

  return (
    <div className="goals-page">
      <section className="goals-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Goals</h1>
          <p>Set gentle intentions and celebrate the progress you make.</p>
        </div>
        <button className="goal-primary-button goal-new-button" type="button" onClick={startCreate}>
          <Plus size={15} />
          New Goal
        </button>
      </section>

      {loadError && <p className="entries-error" role="alert">{loadError}</p>}
      {actionError && <p className="goal-error-banner" role="alert">{actionError}</p>}
      {feedback && <p className="goal-success-banner" role="status">{feedback}</p>}

      <section className="goals-overview" aria-label="Goal overview">
        <GoalStatCard icon={Target} label="Total Goals" value={goals.length} detail="Intentions you've set" tone="violet" />
        <GoalStatCard icon={ArrowUpRight} label="Active Goals" value={activeCount} detail="In progress" tone="blue" />
        <GoalStatCard icon={CircleCheck} label="Completed Goals" value={completedCount} detail="Goals reached" tone="green" />
        <GoalStatCard icon={ChartNoAxesColumnIncreasing} label="Overall Progress" value={`${overallProgress}%`} detail="Average completion" tone="pink" />
      </section>

      {showForm && (
        <GoalForm
          key={editingGoal?.id ?? 'new-goal'}
          goal={editingGoal}
          onSave={handleSaveGoal}
          onCancel={() => {
            setShowForm(false)
            setEditingGoal(null)
          }}
          isSaving={isSaving}
        />
      )}

      <section className="goals-list-section">
        <div className="goals-list-heading">
          <div>
            <h2>Your goals</h2>
            <p>A steady step at a time is still progress.</p>
          </div>
          {goals.length > 0 && (
            <div className="goal-filter-tabs" role="tablist" aria-label="Filter goals">
              {['All', 'Active', 'Completed'].map((status) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === status}
                  className={filter === status ? 'is-selected' : ''}
                  key={status}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="goals-empty-state">
            <span className="goals-empty-icon"><Target size={21} /></span>
            <h2>No goals yet</h2>
            <p>Create your first goal and start tracking your progress.</p>
            <button className="goal-primary-button" type="button" onClick={startCreate}>
              <Plus size={15} />
              New Goal
            </button>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="goals-filter-empty">
            <CircleCheck size={19} />
            <span>No {filter.toLowerCase()} goals right now.</span>
          </div>
        ) : (
          <div className="goals-grid">
            {filteredGoals.map((goal) => {
              const target = Number(goal.target) || 0
              const currentProgress = Math.max(0, Number(goal.currentProgress) || 0)
              const percentage = target > 0
                ? Math.min(100, Math.round((currentProgress / target) * 100))
                : 0
              const isCompleted = goal.status === 'Completed'
              const isProgressOpen = progressGoalId === goal.id
              return (
                <article className={`goal-card${isCompleted ? ' goal-card-completed' : ''}`} key={goal.id}>
                  <div className="goal-card-topline">
                    <span className={`goal-status-pill${isCompleted ? ' is-completed' : ''}`}>
                      <span />
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                    <div className="goal-card-actions">
                      <button type="button" onClick={() => startEdit(goal)} aria-label={`Edit ${goal.title}`}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => removeGoal(goal)} aria-label={`Delete ${goal.title}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3>{goal.title}</h3>
                  {goal.description && <p className="goal-card-description">{goal.description}</p>}
                  <div className="goal-progress-label">
                    <span>Progress</span>
                    <strong>{percentage}%</strong>
                  </div>
                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-label={`${goal.title} progress`}
                    aria-valuemin={0}
                    aria-valuemax={target}
                    aria-valuenow={currentProgress}
                  >
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="goal-progress-count">
                    <strong>{currentProgress} <span>/ {target}</span></strong>
                    <span>{goal.unit}</span>
                  </div>
                  <div className="goal-date-line">
                    <CalendarDays size={13} />
                    <span>Target date</span>
                    <time dateTime={goal.targetDate || undefined}>{getGoalDateLabel(goal.targetDate)}</time>
                  </div>
                  {!isCompleted && (
                    <>
                      {isProgressOpen && (
                        <div className="goal-progress-controls">
                          <span>Adjust progress</span>
                          <div>
                            <button
                              type="button"
                              aria-label={`Decrease ${goal.title} progress`}
                              disabled={currentProgress <= 0}
                              onClick={() => changeProgress(goal, -1)}
                            >
                              <Minus size={14} />
                            </button>
                            <strong>{currentProgress} / {target}</strong>
                            <button
                              type="button"
                              aria-label={`Increase ${goal.title} progress`}
                              disabled={currentProgress >= target}
                              onClick={() => changeProgress(goal, 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="goal-card-footer">
                        <button
                          className="goal-update-progress"
                          type="button"
                          onClick={() => setProgressGoalId(isProgressOpen ? null : goal.id)}
                        >
                          {isProgressOpen ? 'Done' : 'Update Progress'}
                        </button>
                        <button
                          className="goal-complete-button"
                          type="button"
                          onClick={() => completeGoal(goal)}
                        >
                          <Check size={13} />
                          Complete
                        </button>
                      </div>
                    </>
                  )}
                  {isCompleted && (
                    <div className="goal-completed-note">
                      <CircleCheck size={14} />
                      You reached this goal!
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

const settingCategories = ['Personal', 'Work', 'Study', 'Health', 'Other']
const settingMoods = ['Great', 'Good', 'Okay', 'Tired', 'Sad', 'Stressed']

function SettingsSection({ icon: Icon, title, description, children, sectionId }) {
  return (
    <section className="settings-section" aria-labelledby={sectionId}>
      <div className="settings-section-heading">
        <span className="settings-section-icon"><Icon size={16} /></span>
        <div>
          <h2 id={sectionId}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="settings-section-content">{children}</div>
    </section>
  )
}

function SettingsPage({ settings, onSaveSettings, onResetSettings, storageError }) {
  const [formSettings, setFormSettings] = useState(settings)
  const [profileDraft, setProfileDraft] = useState(settings.profile)
  const [editingProfile, setEditingProfile] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const [exportError, setExportError] = useState('')

  const saveChange = (nextSettings, message = 'Settings saved successfully.') => {
    try {
      const saved = onSaveSettings(nextSettings)
      setFormSettings(saved)
      setNotice({ type: 'success', text: message })
      return true
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setNotice({ type: 'error', text: `Could not save settings: ${messageText}` })
      return false
    }
  }

  const handleProfileSave = (event) => {
    event.preventDefault()
    const profile = {
      name: profileDraft.name.trim(),
      email: profileDraft.email.trim(),
      bio: profileDraft.bio.trim(),
    }
    if (!profile.name) {
      setNotice({ type: 'error', text: 'Please enter a profile name.' })
      return
    }
    if (saveChange({ ...formSettings, profile })) {
      setEditingProfile(false)
    }
  }

  const updateNotification = (key, enabled) => {
    saveChange({
      ...formSettings,
      notifications: { ...formSettings.notifications, [key]: enabled },
    })
  }

  const updatePreference = (key, value) => {
    saveChange({
      ...formSettings,
      preferences: { ...formSettings.preferences, [key]: value },
    })
  }

  const handleExport = () => {
    setExportError('')
    try {
      const backup = {
        exportedAt: new Date().toISOString(),
        entries: getEntries(),
        goals: getGoals(),
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const objectUrl = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = objectUrl
      downloadLink.download = 'ai-smart-diary-backup.json'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      setNotice({ type: 'success', text: 'Diary data exported successfully.' })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown export error occurred.'
      setExportError(`Could not export diary data: ${message}`)
    }
  }

  const handleClearData = () => {
    const confirmed = window.confirm(
      'Permanently clear all diary data?\n\nThis removes your diary entries and goals from this browser. Your profile, theme, notification settings, and diary preferences will be kept. This action cannot be undone.',
    )
    if (!confirmed) return

    try {
      window.localStorage.removeItem('ai-smart-diary.entries')
      window.localStorage.removeItem('ai-smart-diary.goals')
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ai-smart-diary.entries',
      }))
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ai-smart-diary.goals',
      }))
      setNotice({ type: 'success', text: 'Diary entries and goals were cleared.' })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setNotice({ type: 'error', text: `Could not clear diary data: ${message}` })
    }
  }

  const handleResetSettings = () => {
    const confirmed = window.confirm(
      'Reset your profile and all settings to their defaults?\n\nYour diary entries and goals will not be deleted.',
    )
    if (!confirmed) return

    try {
      const reset = onResetSettings()
      setFormSettings(reset)
      setProfileDraft(reset.profile)
      setEditingProfile(false)
      setNotice({ type: 'success', text: 'Settings were reset to their defaults.' })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      setNotice({ type: 'error', text: `Could not reset settings: ${message}` })
    }
  }

  const profileName = (editingProfile ? profileDraft.name : formSettings.profile.name).trim() || 'H'

  return (
    <div className="settings-page">
      <section className="settings-page-heading">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1>Settings</h1>
          <p>Make your diary feel a little more like your own.</p>
        </div>
      </section>

      {storageError && (
        <p className="settings-notice is-error" role="alert">
          Could not read saved settings: {storageError}. Defaults are shown until settings can be saved.
        </p>
      )}
      {notice.text && (
        <p className={`settings-notice is-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div className="settings-sections">
        <SettingsSection
          icon={UserRound}
          title="Profile"
          description="The details that make your diary yours."
          sectionId="settings-profile-title"
        >
          {!editingProfile ? (
            <div className="settings-profile-view">
              <span className="settings-profile-avatar" aria-label={`${profileName}'s profile`}>
                {Array.from(profileName)[0]?.toUpperCase() || 'H'}
              </span>
              <div className="settings-profile-details">
                <strong>{formSettings.profile.name || 'Hansini'}</strong>
                <span>{formSettings.profile.email || 'No email added'}</span>
                <p>{formSettings.profile.bio || 'Add a short bio to introduce yourself.'}</p>
              </div>
              <button
                className="settings-secondary-button"
                type="button"
                onClick={() => {
                  setProfileDraft(formSettings.profile)
                  setEditingProfile(true)
                  setNotice({ type: '', text: '' })
                }}
              >
                <Pencil size={13} />
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="settings-profile-form" onSubmit={handleProfileSave}>
              <span className="settings-profile-avatar">
                {Array.from(profileName)[0]?.toUpperCase() || 'H'}
              </span>
              <div className="settings-profile-fields">
                <label className="settings-field">
                  <span>Profile name</span>
                  <input
                    autoFocus
                    maxLength={80}
                    value={profileDraft.name}
                    onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
                    required
                  />
                </label>
                <label className="settings-field">
                  <span>Email</span>
                  <input
                    type="email"
                    maxLength={160}
                    value={profileDraft.email}
                    onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="settings-field settings-field-wide">
                  <span>Short bio</span>
                  <textarea
                    rows={2}
                    maxLength={240}
                    value={profileDraft.bio}
                    onChange={(event) => setProfileDraft((current) => ({ ...current, bio: event.target.value }))}
                    placeholder="A little about you..."
                  />
                </label>
                <div className="settings-form-actions">
                  <button className="settings-secondary-button" type="button" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </button>
                  <button className="settings-primary-button" type="submit">Save Profile</button>
                </div>
              </div>
            </form>
          )}
        </SettingsSection>

        <SettingsSection
          icon={Sun}
          title="Appearance"
          description="Choose the look that feels comfortable to you."
          sectionId="settings-appearance-title"
        >
          <div className="settings-theme-picker" role="radiogroup" aria-label="Theme">
            {[
              { theme: 'dark', label: 'Dark', Icon: Moon, description: 'The original midnight palette' },
              { theme: 'light', label: 'Light', Icon: Sun, description: 'A clean, bright workspace' },
            ].map(({ theme, label, Icon, description }) => (
              <button
                className={`settings-theme-option${formSettings.theme === theme ? ' is-selected' : ''}`}
                type="button"
                role="radio"
                aria-checked={formSettings.theme === theme}
                key={theme}
                onClick={() => saveChange({ ...formSettings, theme })}
              >
                <span className={`settings-theme-preview theme-preview-${theme}`}>
                  <span />
                  <span />
                  <span />
                </span>
                <span className="settings-theme-copy">
                  <strong><Icon size={14} />{label}</strong>
                  <small>{description}</small>
                </span>
                <span className="settings-radio-indicator" />
              </button>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose which gentle reminders you would like to enable."
          sectionId="settings-notifications-title"
        >
          <div className="settings-option-list">
            {[
              { key: 'dailyReminder', title: 'Daily journaling reminder', description: 'A nudge to make a little space for your thoughts.' },
              { key: 'goalReminders', title: 'Goal reminders', description: 'A reminder to check in on your active goals.' },
              { key: 'moodReminders', title: 'Mood check-in reminders', description: 'A prompt to pause and notice how you feel.' },
            ].map(({ key, title, description }) => (
              <div className="settings-toggle-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
                <button
                  className={`settings-switch${formSettings.notifications[key] ? ' is-on' : ''}`}
                  type="button"
                  role="switch"
                  aria-checked={formSettings.notifications[key]}
                  aria-label={title}
                  onClick={() => updateNotification(key, !formSettings.notifications[key])}
                >
                  <span />
                </button>
              </div>
            ))}
          </div>
          <p className="settings-helper-text">These preferences are saved locally. Browser notifications are not enabled yet.</p>
        </SettingsSection>

        <SettingsSection
          icon={NotebookPen}
          title="Diary Preferences"
          description="Set the defaults that appear when you start a new entry."
          sectionId="settings-preferences-title"
        >
          <div className="settings-preferences-grid">
            <label className="settings-field">
              <span>Default diary category</span>
              <select
                value={formSettings.preferences.defaultCategory}
                onChange={(event) => updatePreference('defaultCategory', event.target.value)}
              >
                {settingCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="settings-field">
              <span>Default mood</span>
              <select
                value={formSettings.preferences.defaultMood}
                onChange={(event) => updatePreference('defaultMood', event.target.value)}
              >
                {settingMoods.map((mood) => <option key={mood}>{mood}</option>)}
              </select>
            </label>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={ShieldCheck}
          title="Privacy & Data"
          description="Your diary data is stored locally in your browser."
          sectionId="settings-privacy-title"
        >
          <div className="settings-privacy-callout">
            <ShieldCheck size={17} />
            <p>Your diary data is stored locally in your browser. It is not uploaded to an account or external service.</p>
          </div>
          {exportError && <p className="settings-inline-error" role="alert">{exportError}</p>}
          <div className="settings-data-actions">
            <button className="settings-secondary-button" type="button" onClick={handleExport}>
              <Download size={14} />
              Export Diary Data
            </button>
            <button className="settings-danger-button" type="button" onClick={handleClearData}>
              <Trash2 size={14} />
              Clear All Diary Data
            </button>
          </div>
          <p className="settings-helper-text">Export includes diary entries and goals. Clearing data keeps your profile and preferences.</p>
        </SettingsSection>

        <SettingsSection
          icon={RotateCcw}
          title="Reset Settings"
          description="Restore profile and preferences without removing your diary data."
          sectionId="settings-reset-title"
        >
          <div className="settings-reset-row">
            <p>Profile, theme, notification toggles, and diary defaults will return to their original values.</p>
            <button className="settings-danger-button" type="button" onClick={handleResetSettings}>
              <RotateCcw size={14} />
              Reset Settings
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

function PlaceholderPage({ page }) {
  const Icon = page.icon

  return (
    <div className="placeholder-page">
      <section className="placeholder-heading">
        <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </section>
      <section className="placeholder-card">
        <span className="placeholder-icon"><Icon size={22} strokeWidth={1.8} /></span>
        <h2>{page.cardTitle}</h2>
        <p>{page.cardDescription}</p>
      </section>
    </div>
  )
}

function App() {
  const [dateTime, setDateTime] = useState(getDateTime)
  const [pathname, setPathname] = useState(window.location.pathname)
  const [entryToEdit, setEntryToEdit] = useState(null)
  const [selectedEntryDate, setSelectedEntryDate] = useState(null)
  const [settingsState, setSettingsState] = useState(() => {
    try {
      return { settings: getSettings(), error: '' }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown storage error occurred.'
      return { settings: structuredClone(defaultSettings), error: message }
    }
  })
  const { settings } = settingsState

  const navigate = (path) => {
    if (window.location.pathname === path) return
    window.history.pushState({}, '', path)
    setPathname(path)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => setDateTime(getDateTime()), 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const isNewEntryPage = pathname === '/diary/new'
  const openNewEntry = (dateKey = null) => {
    setEntryToEdit(null)
    setSelectedEntryDate(dateKey)
    navigate('/diary/new')
  }
  const openEntryForEdit = (entry) => {
    setEntryToEdit(entry)
    setSelectedEntryDate(null)
    navigate('/diary/new')
  }
  const handleSaveSettings = (nextSettings) => {
    const savedSettings = saveSettings(nextSettings)
    setSettingsState({ settings: savedSettings, error: '' })
    return savedSettings
  }
  const handleResetSettings = () => {
    const reset = resetSettings()
    setSettingsState({ settings: reset, error: '' })
    return reset
  }
  const placeholderPage = placeholderPages[pathname]
  const currentPage = isNewEntryPage
    ? 'Entries'
    : navigationItems.find((item) => item.path === pathname)?.label ?? 'Home'

  return (
    <div className="app-shell" id="home" data-theme={settings.theme}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        onNewEntry={openNewEntry}
      />
      <main className="main-content">
        <Topbar dateTime={dateTime} profile={settings.profile} />
        {isNewEntryPage ? (
          <NewEntryPage
            key={entryToEdit?.id ?? 'new-entry'}
            dateTime={dateTime}
            entryToEdit={entryToEdit}
            selectedDate={selectedEntryDate}
            preferences={settings.preferences}
          />
        ) : pathname === '/entries' ? (
          <EntriesPage onNewEntry={openNewEntry} onEditEntry={openEntryForEdit} />
        ) : pathname === '/calendar' ? (
          <CalendarPage onNewEntry={openNewEntry} />
        ) : pathname === '/insights' ? (
          <InsightsPage onNewEntry={openNewEntry} />
        ) : pathname === '/goals' ? (
          <GoalsPage />
        ) : pathname === '/mood-tracker' ? (
          <MoodTrackerPage onNewEntry={openNewEntry} />
        ) : pathname === '/ai-assistant' ? (
          <AIAssistantPage
            onNewEntry={openNewEntry}
            profileName={settings.profile.name.trim() || 'Hansini'}
          />
        ) : pathname === '/settings' ? (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
            storageError={settingsState.error}
          />
        ) : placeholderPage ? (
          <PlaceholderPage page={placeholderPage} />
        ) : (
        <div className="dashboard-content">
          <section className="welcome-section">
            <div className="welcome-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
              <h1>A little space for <span>you.</span></h1>
              <p>Every thought has a place here. Let&apos;s make today count.</p>
            </div>
            <div className="welcome-decoration" aria-hidden="true">
              <div className="decoration-orbit orbit-one" />
              <div className="decoration-orbit orbit-two" />
              <div className="decoration-sparkle"><Sparkles size={25} /></div>
              <span className="decoration-star star-one">✦</span>
              <span className="decoration-star star-two">✧</span>
            </div>
          </section>

          <section className="section-block" aria-labelledby="stats-title">
            <div className="section-heading">
              <div>
                <h2 id="stats-title">Your journey at a glance</h2>
                <p>A few little reminders of how far you&apos;ve come.</p>
              </div>
              <span className="period-select">This month <ChevronRight size={15} /></span>
            </div>
            <div className="stats-grid">
              {statistics.map((statistic) => (
                <StatCard key={statistic.label} statistic={statistic} />
              ))}
            </div>
          </section>

          <section className="section-block entries-section" aria-labelledby="entries-title">
            <div className="section-heading">
              <div>
                <h2 id="entries-title">Recent entries</h2>
                <p>Your thoughts, moments, and everything in between.</p>
              </div>
              <button className="text-link" type="button">
                View all entries <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="entries-grid">
              {recentEntries.map((entry) => <EntryCard entry={entry} key={entry.title} />)}
              <button className="write-prompt-card" type="button">
                <span className="prompt-icon"><Plus size={19} /></span>
                <span className="prompt-title">A thought on your mind?</span>
                <span className="prompt-description">Take a moment to write it down.</span>
                <span className="prompt-action">Start writing <ChevronRight size={15} /></span>
              </button>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>Made for your inner world <span className="footer-heart">♥</span></span>
            <span className="footer-insight"><Sparkles size={13} /> Your journal is your safe space</span>
          </footer>
        </div>
        )}
      </main>
    </div>
  )
}

export default App
