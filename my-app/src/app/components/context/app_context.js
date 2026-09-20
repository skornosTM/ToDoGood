"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "pixeldone_app_v1"

const defaultSettings = {
  accent: "green",
  theme: "night",
  glow: 15,
  radius: 15,
  fontScale: 1,
  borderWidth: 2,
  mutedOpacity: 0.65,
  cardPadding: 16,
  columnGap: 16,
  compact: false,
  showProgress: true,
  showAvatars: true,
  showMeta: true,
  showDates: true,
  showPriority: true,
  statusColors: true,
  animations: true,
  animationMs: 200,
  cardShadow: true,
  greetEmoji: true,
  highContrast: false,
  sidebarPercent: 18,
  dateFormat: "dd mmm",
  defaultSort: "date",
  language: "ru",
}

const demoProjects = [
  { id: "p1", name: "Design system" },
  { id: "p2", name: "User flow" },
  { id: "p3", name: "Ux research" },
  { id: "p4", name: "Dribbble marketing" },
]

const demoTasks = [
  { id: "t1", title: "Design new ui presentation", projectId: "p4", status: "todo", done: 7, total: 10, due: "2022-05-24", comments: 2, attachments: 2, assignees: ["👩", "👨"], priority: "medium" },
  { id: "t2", title: "Add more ui/ux mockups", projectId: "p3", status: "todo", done: 4, total: 10, due: "2022-05-08", comments: 1, attachments: 2, assignees: ["👩"], priority: "high" },
  { id: "t3", title: "Design few mobile screens", projectId: "p2", status: "todo", done: 3, total: 10, due: "2022-05-09", comments: 2, attachments: 1, assignees: ["😎"], priority: "low" },
  { id: "t4", title: "Create a telegram bot", projectId: "p1", status: "todo", done: 2, total: 10, due: "2022-05-24", comments: 7, attachments: 8, assignees: ["👩", "👨"], priority: "medium" },
  { id: "t5", title: "Complete the project", projectId: "p3", status: "progress", done: 8, total: 10, due: "2022-05-08", comments: 1, attachments: 2, assignees: ["👩"], priority: "high" },
  { id: "t6", title: "Add more ui/ux mockups", projectId: "p3", status: "progress", done: 6, total: 10, due: "2022-05-08", comments: 1, attachments: 2, assignees: ["👩", "😎"], priority: "medium" },
  { id: "t7", title: "Design few mobile screens", projectId: "p2", status: "progress", done: 4, total: 10, due: "2022-05-09", comments: 2, attachments: 1, assignees: ["😎"], priority: "low" },
  { id: "t8", title: "Create a telegram bot", projectId: "p1", status: "progress", done: 2, total: 10, due: "2022-05-24", comments: 7, attachments: 8, assignees: ["👩", "👨"], priority: "medium" },
  { id: "t9", title: "Complete the project", projectId: "p3", status: "done", done: 10, total: 10, due: "2022-05-08", comments: 1, attachments: 2, assignees: ["👩"], priority: "high" },
  { id: "t10", title: "Add more ui/ux mockups", projectId: "p3", status: "done", done: 10, total: 10, due: "2022-05-08", comments: 1, attachments: 2, assignees: ["👩"], priority: "low" },
  { id: "t11", title: "Design few mobile screens", projectId: "p2", status: "done", done: 10, total: 10, due: "2022-05-09", comments: 2, attachments: 1, assignees: ["😎"], priority: "medium" },
]

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function loadState() {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [panel, setPanel] = useState("tasks")
  const [profileOpen, setProfileOpen] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [boardViews, setBoardViews] = useState([])
  const [activeViewId, setActiveViewId] = useState(null)
  const [activeProjectId, setActiveProjectId] = useState("all")
  const [taskNav, setTaskNav] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [filterPriority, setFilterPriority] = useState("all")
  const [search, setSearch] = useState("")
  const [authError, setAuthError] = useState("")
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      if (saved.user) setUser(saved.user)
      if (saved.users) setUsers(saved.users)
      if (saved.settings) {
        setSettings({ ...defaultSettings, ...saved.settings })
        if (saved.settings.defaultSort) setSortBy(saved.settings.defaultSort)
      }
      if (saved.projects?.length) setProjects(saved.projects)
      else setProjects(demoProjects)
      if (saved.tasks !== undefined) setTasks(saved.tasks)
      else setTasks(demoTasks)
      if (saved.boardViews?.length) setBoardViews(saved.boardViews)
      else setBoardViews([{ id: "board", name: "Board view" }])
      if (saved.activeViewId) setActiveViewId(saved.activeViewId)
      else setActiveViewId("board")
      if (saved.messages?.length) setMessages(saved.messages)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, users, settings, projects, tasks, boardViews, activeViewId, messages })
    )
  }, [ready, user, users, settings, projects, tasks, boardViews, activeViewId, messages])

  const cssVars = useMemo(() => {
    const accents = {
      green: { accent: "0, 136, 102", bright: "0, 173, 130", dim: "0, 110, 83" },
      red: { accent: "176, 48, 62", bright: "220, 72, 84", dim: "130, 32, 44" },
      blue: { accent: "42, 110, 196", bright: "70, 148, 230", dim: "28, 78, 150" },
    }
    const a = accents[settings.accent] || accents.green
    return {
      "--accent": a.accent,
      "--accent-bright": a.bright,
      "--accent-dim": a.dim,
      "--glow-size": `${settings.glow}px`,
      "--radius": `${settings.radius}px`,
      "--font-scale": String(settings.fontScale),
      "--border-w": `${settings.borderWidth}px`,
      "--muted-opacity": String(settings.mutedOpacity),
      "--card-pad": `${settings.cardPadding}px`,
      "--col-gap": `${settings.columnGap}px`,
      "--anim": settings.animations ? `${settings.animationMs}ms` : "0ms",
      "--sidebar-w": `${settings.sidebarPercent}%`,
    }
  }, [settings])

  function register({ nickname, password, avatar }) {
    setAuthError("")
    if (!nickname?.trim() || !password) {
      setAuthError("Заполните ник и пароль")
      return false
    }
    if (users.some((u) => u.nickname === nickname.trim())) {
      setAuthError("Такой ник уже занят")
      return false
    }
    const next = { nickname: nickname.trim(), password, avatar: avatar || "💚" }
    setUsers((prev) => [...prev, next])
    // Новый аккаунт — пустой todo list
    setUser({ nickname: next.nickname, avatar: next.avatar })
    setTasks([])
    setProjects(demoProjects)
    setBoardViews([{ id: "board", name: "Board view" }])
    setActiveViewId("board")
    setMessages([])
    return true
  }

  function login({ nickname, password }) {
    setAuthError("")
    const found = users.find((u) => u.nickname === nickname && u.password === password)
    if (!found) {
      setAuthError("Неверный ник или пароль")
      return false
    }
    setUser({ nickname: found.nickname, avatar: found.avatar })
    return true
  }

  function logout() {
    setUser(null)
    setPanel("tasks")
    setProfileOpen(false)
  }

  function patchSettings(partial) {
    setSettings((prev) => ({ ...prev, ...partial }))
    if (partial.defaultSort) setSortBy(partial.defaultSort)
  }

  function resetSettings() {
    setSettings({ ...defaultSettings })
  }

  function addProject(name) {
    const trimmed = name?.trim()
    if (!trimmed) return
    const project = { id: uid("p"), name: trimmed }
    setProjects((prev) => [...prev, project])
    setActiveProjectId(project.id)
  }

  function addTask(payload) {
    const task = {
      id: uid("t"),
      title: payload.title?.trim() || "New task",
      projectId: payload.projectId || projects[0]?.id || "p1",
      status: payload.status || "todo",
      done: Number(payload.done) || 0,
      total: Number(payload.total) || 10,
      due: payload.due || new Date().toISOString().slice(0, 10),
      comments: Number(payload.comments) || 0,
      attachments: Number(payload.attachments) || 0,
      assignees: payload.assignees?.length ? payload.assignees : [user?.avatar || "💚"],
      priority: payload.priority || "medium",
    }
    setTasks((prev) => [task, ...prev])
  }

  function updateTask(id, partial) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...partial } : t)))
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function moveTask(id, status) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next = { ...t, status }
        if (status === "done") next.done = next.total
        return next
      })
    )
  }

  function addView(name) {
    const trimmed = name?.trim()
    if (!trimmed) return
    const view = { id: uid("v"), name: trimmed, tasks: [] }
    setBoardViews((prev) => [...prev, view])
    setActiveViewId(view.id)
  }

  function getTasksForView(viewId) {
    const view = boardViews.find((v) => v.id === viewId)
    return view ? view.tasks : tasks
  }

  function setTasksForView(viewId, newTasks) {
    setBoardViews((prev) =>
      prev.map((v) => (v.id === viewId ? { ...v, tasks: newTasks } : v))
    )
  }

  function addMessage(text) {
    if (!text?.trim() || !user) return
    setMessages((prev) => [
      { id: uid("m"), from: user.nickname, text: text.trim(), at: Date.now() },
      ...prev,
    ])
  }

  function restoreDemo() {
    setProjects(demoProjects)
    setTasks(demoTasks)
  }

  const progressPercent = useMemo(() => {
    if (!tasks.length) return 0
    const sum = tasks.reduce((acc, t) => acc + (t.total ? t.done / t.total : 0), 0)
    return Math.round((sum / tasks.length) * 100)
  }, [tasks])

  const value = {
    user,
    users,
    panel,
    setPanel,
    profileOpen,
    setProfileOpen,
    settings,
    patchSettings,
    resetSettings,
    cssVars,
    projects,
    tasks,
    boardViews,
    activeViewId,
    setActiveViewId,
    activeProjectId,
    setActiveProjectId,
    taskNav,
    setTaskNav,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    search,
    setSearch,
    authError,
    messages,
    progressPercent,
    register,
    login,
    logout,
    addProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addView,
    addMessage,
    restoreDemo,
    getTasksForView,
    setTasksForView,
  }

  return (
    <AppContext.Provider value={value}>
      <div
        className="theme-root"
        data-theme={settings.theme}
        data-accent={settings.accent}
        data-compact={settings.compact ? "1" : "0"}
        data-contrast={settings.highContrast ? "1" : "0"}
        data-shadow={settings.cardShadow ? "1" : "0"}
        style={cssVars}
      >
        {ready ? children : <div className="auth" />}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export { defaultSettings }
