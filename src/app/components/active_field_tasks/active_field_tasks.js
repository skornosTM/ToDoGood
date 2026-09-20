"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  Calendar,
  Filter,
  List,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Sun,
  Moon,
} from "lucide-react"
import { useApp } from "../context/app_context"
import "./active_field_tasks.css"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(iso, mode) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, "0")
  const mmm = MONTHS[d.getMonth()]
  const yyyy = d.getFullYear()
  if (mode === "yyyy-mm-dd") return iso
  if (mode === "dd.mm.yyyy") return `${dd}.${String(d.getMonth() + 1).padStart(2, "0")}.${yyyy}`
  return `${dd} ${mmm}`
}

function progressTone(task, statusColors) {
  if (!statusColors) return "accent"
  const ratio = task.total ? task.done / task.total : 0
  if (task.status === "done" || ratio >= 1) return "done"
  if (task.priority === "high" || ratio >= 0.7) return "hot"
  return "warn"
}

function TaskCard({ task, projectName, settings, onEdit, onMenu, dragged, onDragStart }) {
  const dueClass = task.priority === "high" ? "is-urgent" : ""
  return (
    <article
      className={`task-card ${dragged ? "is-dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDoubleClick={() => onEdit(task)}
    >
      <div className="task-card-head">
        <div>
          <h4>{task.title}</h4>
          <p>{projectName}</p>
        </div>
        <button className="ghost-icon" onClick={() => onMenu(task)} aria-label="Task menu">
          <MoreHorizontal size={16} />
        </button>
      </div>
      {settings.showProgress && (
        <div className="task-progress">
          <div className="task-progress-label">
            <span>Progress</span>
            <List size={12} />
          </div>
          <div className="task-progress-row">
            <div className="task-progress-bar">
              <div
                className={`task-progress-fill tone-${progressTone(task, settings.statusColors)}`}
                style={{ width: `${Math.min(100, (task.done / Math.max(task.total, 1)) * 100)}%` }}
              />
            </div>
            <span>
              {task.done}/{task.total}
            </span>
          </div>
        </div>
      )}
      <div className="task-card-foot">
        {settings.showDates && (
          <span className={`date-pill ${dueClass}`}>{formatDate(task.due, settings.dateFormat)}</span>
        )}
        <div className="task-card-meta">
          {settings.showMeta && (
            <>
              <span>
                <MessageSquare size={12} /> {task.comments}
              </span>
              <span>
                <Paperclip size={12} /> {task.attachments}
              </span>
            </>
          )}
          {settings.showPriority && <em className={`prio prio-${task.priority}`}>{task.priority}</em>}
          {settings.showAvatars && (
            <div className="avatars">
              {task.assignees.map((a, i) => (
                <span key={`${task.id}-a-${i}`}>{a}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

const emptyDraft = {
  title: "",
  projectId: "",
  status: "todo",
  done: 0,
  total: 10,
  due: "",
  comments: 0,
  attachments: 0,
  priority: "medium",
  assignees: "",
}

export default function Active_field_tasks() {
  const app = useApp()
  const {
    user,
    settings,
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
    addProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addView,
    patchSettings,
    messages,
    addMessage,
    getTasksForView,
    setTasksForView,
  } = app

  const [projectName, setProjectName] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [modal, setModal] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [menuTask, setMenuTask] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [remindersOpen, setRemindersOpen] = useState(true)
  const [messengersOpen, setMessengersOpen] = useState(false)
  const [note, setNote] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [reminderTitle, setReminderTitle] = useState("")
  const [reminderDate, setReminderDate] = useState("")
  const [reminderProject, setReminderProject] = useState("")

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  )

  const currentViewTasks = useMemo(() => {
    if (activeViewId) {
      return getTasksForView(activeViewId) || []
    }
    return tasks
  }, [activeViewId, tasks, getTasksForView])

  const visibleTasks = useMemo(() => {
    let list = [...currentViewTasks]
    if (activeProjectId !== "all") list = list.filter((t) => t.projectId === activeProjectId)
    if (taskNav !== "all") list = list.filter((t) => t.status === taskNav)
    if (filterPriority !== "all") list = list.filter((t) => t.priority === filterPriority)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (projectMap[t.projectId] || "").toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "progress") return b.done / b.total - a.done / a.total
      if (sortBy === "priority") {
        const rank = { high: 3, medium: 2, low: 1 }
        return (rank[b.priority] || 0) - (rank[a.priority] || 0)
      }
      return String(a.due).localeCompare(String(b.due))
    })
    return list
  }, [currentViewTasks, activeProjectId, taskNav, filterPriority, search, sortBy, projectMap])

  const columns = [
    { id: "todo", title: "To do" },
    { id: "progress", title: "In progress" },
    { id: "done", title: "Done" },
  ]

  function openCreate(status) {
    setDraft({
      ...emptyDraft,
      status,
      projectId: activeProjectId === "all" ? projects[0]?.id || "" : activeProjectId,
      due: new Date().toISOString().slice(0, 10),
      assignees: user?.avatar || "",
    })
    setModal("create")
    setMenuTask(null)
  }

  function openEdit(task) {
    setDraft({
      ...task,
      assignees: (task.assignees || []).join(" "),
    })
    setModal("edit")
    setMenuTask(null)
  }

  function saveModal(e) {
    e.preventDefault()
    const payload = {
      ...draft,
      assignees: String(draft.assignees)
        .split(/\s+/)
        .filter(Boolean),
      done: Number(draft.done),
      total: Number(draft.total) || 1,
      comments: Number(draft.comments),
      attachments: Number(draft.attachments),
    }
    if (modal === "edit") {
      updateTask(draft.id, payload)
      // Обновляем и в текущей доске
      if (activeViewId) {
        const viewTasks = getTasksForView(activeViewId) || []
        setTasksForView(activeViewId, viewTasks.map((t) => (t.id === draft.id ? { ...t, ...payload } : t)))
      }
    } else {
      const newTask = {
        id: `t_${Date.now()}`,
        ...payload,
        projectId: activeProjectId === "all" ? projects[0]?.id : activeProjectId,
      }
      addTask(newTask)
      if (activeViewId) {
        const viewTasks = getTasksForView(activeViewId) || []
        setTasksForView(activeViewId, [newTask, ...viewTasks])
      }
    }
    setModal(null)
  }

  function applyTemplate(type) {
    const templates = {
      design: { title: "UI presentation template", status: "todo", total: 10, done: 0, priority: "medium" },
      bug: { title: "Fix reported bug", status: "todo", total: 6, done: 0, priority: "high" },
      research: { title: "UX research notes", status: "todo", total: 8, done: 1, priority: "low" },
    }
    const newTask = {
      id: `t_${Date.now()}`,
      ...templates[type],
      projectId: activeProjectId === "all" ? projects[0]?.id : activeProjectId,
      due: new Date().toISOString().slice(0, 10),
      assignees: [user?.avatar || "💚"],
    }
    addTask(newTask)
    if (activeViewId) {
      const viewTasks = getTasksForView(activeViewId) || []
      setTasksForView(activeViewId, [newTask, ...viewTasks])
    }
    setShowMore(false)
  }

  function onDropColumn(status) {
    if (dragId) {
      moveTask(dragId, status)
      // Обновляем и в текущей доске
      if (activeViewId) {
        const viewTasks = getTasksForView(activeViewId) || []
        setTasksForView(activeViewId, viewTasks.map((t) => (t.id === dragId ? { ...t, status } : t)))
      }
    }
    setDragId(null)
  }

  const reminders = [...currentViewTasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => String(a.due).localeCompare(String(b.due)))
    .slice(0, 6)

  return (
    <div className="app_active_field_tasks">
      <aside className="map_active_field_tasks">
        <div className="active_field_tasks_project">
          <p>PROJECTS</p>
          <button
            className="active_field_tasks_project_button"
            onClick={() => {
              const name = projectName || window.prompt("Project name")
              if (name) {
                addProject(name)
                setProjectName("")
              }
            }}
          >
            +
          </button>
        </div>
        <input
          className="side-input"
          placeholder="New project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addProject(projectName)
              setProjectName("")
            }
          }}
        />
        <nav className="side-nav">
          <p className="side-label">Projects</p>
          <button className={activeProjectId === "all" ? "is-on" : ""} onClick={() => setActiveProjectId("all")}>
            All projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              className={activeProjectId === p.id ? "is-on" : ""}
              onClick={() => setActiveProjectId(p.id)}
            >
              {p.name}
            </button>
          ))}
          <p className="side-label">Tasks</p>
          {["all", "todo", "progress", "done"].map((key) => (
            <button key={key} className={taskNav === key ? "is-on" : ""} onClick={() => setTaskNav(key)}>
              {key === "all" ? "All tasks" : key === "todo" ? "To do" : key === "progress" ? "In progress" : "Done"}
            </button>
          ))}
          <button className="side-fold" onClick={() => setRemindersOpen((v) => !v)}>
            Reminders {remindersOpen ? "▾" : "▸"}
          </button>
          {remindersOpen && (
            <>
              {reminders.map((t) => (
                <button key={t.id} className="side-sub" onClick={() => openEdit(t)}>
                  {t.title} · {formatDate(t.due, settings.dateFormat)}
                </button>
              ))}
              <div className="reminder-form">
                <input
                  className="side-input"
                  placeholder="Название напоминания"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                />
                <input
                  className="side-input"
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
                <select
                  className="side-input"
                  value={reminderProject}
                  onChange={(e) => setReminderProject(e.target.value)}
                >
                  <option value="">Выберите проект</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  className="reminder-submit"
                  onClick={() => {
                    if (reminderTitle.trim() && reminderDate) {
                      const newTask = {
                        id: `t_${Date.now()}`,
                        title: reminderTitle.trim(),
                        projectId: reminderProject || projects[0]?.id || "",
                        status: "todo",
                        done: 0,
                        total: 10,
                        due: reminderDate,
                        comments: 0,
                        attachments: 0,
                        assignees: [user?.avatar || "💚"],
                        priority: "medium",
                      }
                      addTask(newTask)
                      if (activeViewId) {
                        const viewTasks = getTasksForView(activeViewId) || []
                        setTasksForView(activeViewId, [newTask, ...viewTasks])
                      }
                      setReminderTitle("")
                      setReminderDate("")
                      setReminderProject("")
                    }
                  }}
                >
                  + Добавить
                </button>
              </div>
            </>
          )}
          <button className="side-fold" onClick={() => setMessengersOpen((v) => !v)}>
            Messengers {messengersOpen ? "▾" : "▸"}
          </button>
          {messengersOpen && (
            <div className="side-messages">
              {messages.map((m) => (
                <p key={m.id}>
                  <b>{m.from}:</b> {m.text}
                </p>
              ))}
              <input
                value={note}
                placeholder="Write..."
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addMessage(note)
                    setNote("")
                  }
                }}
              />
            </div>
          )}
        </nav>
        <div className="theme-toggle">
          <button
            className={settings.theme === "day" ? "is-on" : ""}
            onClick={() => patchSettings({ theme: "day" })}
          >
            <Sun size={14} /> Light
          </button>
          <button
            className={settings.theme === "night" ? "is-on" : ""}
            onClick={() => patchSettings({ theme: "night" })}
          >
            <Moon size={14} /> Dark
          </button>
        </div>
      </aside>

      <section className="tasks_active_field_tasks">
        <header className="board-top">
          <h2>
            Welcome back, {user?.nickname}
            {settings.greetEmoji ? " 👋" : ""}
          </h2>
          <div className="board-top-tools">
            <button className="ghost-icon" onClick={() => setSearchOpen((v) => !v)}>
              <Search size={18} />
            </button>
            <button className="ghost-icon" title="Notifications">
              <Bell size={18} />
            </button>
            <span className="date-chip">
              <Calendar size={14} /> {formatDate(new Date().toISOString().slice(0, 10), settings.dateFormat)}
            </span>
            <span className="user-bubble">{user?.avatar}</span>
          </div>
        </header>
        {searchOpen && (
          <input
            className="search-line"
            autoFocus
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
        <div className="active_field_tasks_purposes_map">
          <div className="view-tabs">
            {boardViews.map((v) => (
              <button
                key={v.id}
                className={activeViewId === v.id ? "is-on" : ""}
                onClick={() => setActiveViewId(v.id)}
              >
                {v.name}
              </button>
            ))}
            <button
              className="add-view"
              onClick={() => {
                const name = window.prompt("View name", "New view")
                if (name) addView(name)
              }}
            >
              <span>+</span> Add view
            </button>
          </div>
          <div className="view-actions">
            <div className="pop-wrap">
              <button onClick={() => { setShowFilter((v) => !v); setShowSort(false); setShowMore(false) }}>
                <Filter size={14} /> Filter
              </button>
              {showFilter && (
                <div className="pop">
                  {["all", "low", "medium", "high"].map((p) => (
                    <button key={p} className={filterPriority === p ? "is-on" : ""} onClick={() => setFilterPriority(p)}>
                      {p === "all" ? "All priorities" : p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pop-wrap">
              <button onClick={() => { setShowSort((v) => !v); setShowFilter(false); setShowMore(false) }}>
                Sort
              </button>
              {showSort && (
                <div className="pop">
                  {["date", "title", "progress", "priority"].map((s) => (
                    <button key={s} className={sortBy === s ? "is-on" : ""} onClick={() => setSortBy(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pop-wrap">
              <button onClick={() => { setShowMore((v) => !v); setShowFilter(false); setShowSort(false) }}>
                <MoreHorizontal size={16} />
              </button>
              {showMore && (
                <div className="pop">
                  <button onClick={() => applyTemplate("design")}>Template: Design</button>
                  <button onClick={() => applyTemplate("bug")}>Template: Bug</button>
                  <button onClick={() => applyTemplate("research")}>Template: Research</button>
                </div>
              )}
            </div>
            <button className="new-template" onClick={() => applyTemplate("design")}>
              New template
            </button>
          </div>
        </div>

        <div className="kanban">
          {columns.map((col) => {
            const colTasks = visibleTasks.filter((t) => t.status === col.id)
            return (
              <div
                key={col.id}
                className="kanban-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropColumn(col.id)}
              >
                <div className="kanban-col-head">
                  <strong>
                    {col.title} ({colTasks.length})
                  </strong>
                  <button onClick={() => openCreate(col.id)}>+ Add new task</button>
                </div>
                <div className="kanban-list">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectName={projectMap[task.projectId] || "Project"}
                      settings={settings}
                      onEdit={openEdit}
                      onMenu={setMenuTask}
                      dragged={dragId === task.id}
                      onDragStart={(e, id) => {
                        setDragId(id)
                        e.dataTransfer.effectAllowed = "move"
                      }}
                    />
                  ))}
                  {col.id === "done" && (
                    <div
                      className="drop-hint"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropColumn("done")}
                    >
                      Drag your task here...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {menuTask && (
        <div className="menu-layer" onClick={() => setMenuTask(null)}>
          <div className="task-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => openEdit(menuTask)}>Edit</button>
            <button onClick={() => { moveTask(menuTask.id, "todo"); setMenuTask(null) }}>Move to To do</button>
            <button onClick={() => { moveTask(menuTask.id, "progress"); setMenuTask(null) }}>Move to In progress</button>
            <button onClick={() => { moveTask(menuTask.id, "done"); setMenuTask(null) }}>Move to Done</button>
            <button className="danger" onClick={() => { deleteTask(menuTask.id); setMenuTask(null) }}>
              Delete
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="menu-layer" onClick={() => setModal(null)}>
          <form className="task-modal" onClick={(e) => e.stopPropagation()} onSubmit={saveModal}>
            <h3>{modal === "edit" ? "Edit task" : "New task"}</h3>
            <label>
              Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
            </label>
            <label>
              Project
              <select value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-grid">
              <label>
                Status
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="todo">To do</option>
                  <option value="progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label>
                Priority
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Done
                <input type="number" min="0" value={draft.done} onChange={(e) => setDraft({ ...draft, done: e.target.value })} />
              </label>
              <label>
                Total
                <input type="number" min="1" value={draft.total} onChange={(e) => setDraft({ ...draft, total: e.target.value })} />
              </label>
              <label>
                Due
                <input type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} />
              </label>
              <label>
                Comments
                <input type="number" min="0" value={draft.comments} onChange={(e) => setDraft({ ...draft, comments: e.target.value })} />
              </label>
              <label>
                Files
                <input type="number" min="0" value={draft.attachments} onChange={(e) => setDraft({ ...draft, attachments: e.target.value })} />
              </label>
              <label>
                Assignees
                <input value={draft.assignees} onChange={(e) => setDraft({ ...draft, assignees: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions">
              {modal === "edit" && (
                <button type="button" className="danger" onClick={() => { deleteTask(draft.id); setModal(null) }}>
                  Delete
                </button>
              )}
              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="new-template">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
