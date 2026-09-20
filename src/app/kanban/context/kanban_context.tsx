"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  KanbanContextValue,
  KanbanSettings,
  Task,
  Project,
  Notification,
  Message,
  Reminder,
} from "../types";
// import { v4 as uuidv4 } from 'uuid'; // was using uuid but switched to uid()

const STORAGE_KEY = "kanban_board_v2";

const DEFAULT_SETTINGS: KanbanSettings = {
  accentColor: "green",
  theme: "night",
  showDashedGrid: false,
  filterProject: "all",
  filterDeadline: "all",
  sortBy: "deadline",
  notificationsEnabled: true,
  fontSize: "medium",
  language: "ru",
};

const ACCENT_HEX: Record<string, string> = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
};

const FONT_SCALE: Record<string, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

const DEMO_PROJECTS: Project[] = [
  { id: "p1", name: "Веб-платформа", color: "#22c55e" },
  { id: "p2", name: "Бэкенд", color: "#3b82f6" },
  { id: "p3", name: "Документация", color: "#f59e0b" },
  { id: "p4", name: "Маркетинг", color: "#ef4444" },
];

const DEMO_TASKS: Task[] = [
  {
    id: "t1",
    title: "Дизайн главной страницы",
    description: "Сделать макет главной страницы в Figma",
    column: "done",
    progress: 100,
    deadline: "2026-08-20",
    comments: 5,
    attachments: 3,
    project: "Веб-платформа",
    priority: "high",
    assignees: ["Алексей", "Мария"],
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-20T15:00:00Z",
  },
  {
    id: "t2",
    title: "Настройка базы данных",
    description: "PostgreSQL + миграции",
    column: "done",
    progress: 100,
    deadline: "2026-08-25",
    comments: 3,
    attachments: 2,
    project: "Бэкенд",
    priority: "high",
    assignees: ["Дмитрий"],
    createdAt: "2026-08-05T10:00:00Z",
    updatedAt: "2026-08-25T15:00:00Z",
  },
  {
    id: "t3",
    title: "Авторизация через OAuth",
    description: "Google и GitHub вход",
    column: "inprogress",
    progress: 60,
    deadline: "2026-09-10",
    comments: 8,
    attachments: 4,
    project: "Бэкенд",
    priority: "high",
    assignees: ["Дмитрий", "Алексей"],
    createdAt: "2026-08-10T10:00:00Z",
    updatedAt: "2026-09-01T12:00:00Z",
  },
  {
    id: "t4",
    title: "Компоненты UI-библиотеки",
    description: "Button, Input, Card, Modal",
    column: "inprogress",
    progress: 40,
    deadline: "2026-09-15",
    comments: 2,
    attachments: 6,
    project: "Веб-платформа",
    priority: "medium",
    assignees: ["Мария"],
    createdAt: "2026-08-15T10:00:00Z",
    updatedAt: "2026-09-02T09:00:00Z",
  },
  {
    id: "t5",
    title: "Мобильная адаптация",
    description: "Адаптив для телефонов",
    column: "inprogress",
    progress: 20,
    deadline: "2026-09-20",
    comments: 1,
    attachments: 2,
    project: "Веб-платформа",
    priority: "medium",
    assignees: ["Мария", "Алексей"],
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-09-03T14:00:00Z",
  },
  {
    id: "t6",
    title: "REST API для задач",
    description: "CRUD endpoints",
    column: "todo",
    progress: 0,
    deadline: "2026-09-25",
    comments: 0,
    attachments: 0,
    project: "Бэкенд",
    priority: "high",
    assignees: ["Дмитрий"],
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z",
  },
  {
    id: "t7",
    title: "Тестирование API",
    description: "Юнит-тесты через Jest",
    column: "todo",
    progress: 0,
    deadline: "2026-10-01",
    comments: 0,
    attachments: 0,
    project: "Бэкенд",
    priority: "medium",
    assignees: ["Алексей"],
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "t8",
    title: "Документация API",
    description: "Swagger спецификация",
    column: "todo",
    progress: 0,
    deadline: "2026-10-05",
    comments: 0,
    attachments: 0,
    project: "Документация",
    priority: "low",
    assignees: ["Мария"],
    createdAt: "2026-09-03T10:00:00Z",
    updatedAt: "2026-09-03T10:00:00Z",
  },
];

const DEMO_MESSAGES: Message[] = [
  { id: "m1", from: "Алексей", text: "Проверь задачу по дизайну", at: Date.now() - 3600000 },
  { id: "m2", from: "Мария", text: "Компоненты UI почти готовы", at: Date.now() - 7200000 },
];

function uid(prefix?: string): string {
  return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// gen unique id — was using uuid package but this is simpler
function generateId(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).substring(2, 10) + Date.now();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(tasks: Task[], settings: KanbanSettings, projects: Project[], messages: Message[], reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, settings, projects, messages, reminders }));
  } catch (err) {
    // quota exceeded or something
    console.warn("saveState failed", err);
  }
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = loadState();
    return saved?.tasks?.length ? saved.tasks : DEMO_TASKS;
  });

  const [settings, setSettings] = useState<KanbanSettings>(() => {
    const saved = loadState();
    return saved?.settings ? { ...DEFAULT_SETTINGS, ...saved.settings } : DEFAULT_SETTINGS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = loadState();
    return saved?.projects?.length ? saved.projects : DEMO_PROJECTS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = loadState();
    return saved?.messages?.length ? saved.messages : DEMO_MESSAGES;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = loadState();
    return saved?.reminders?.length ? saved.reminders : [];
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    saveState(tasks, settings, projects, messages, reminders);
    // console.log('saved', tasks.length, 'tasks'); // DEBUG
  }, [tasks, settings, projects, messages, reminders]);

  const accentColorHex = ACCENT_HEX[settings.accentColor] || ACCENT_HEX.green;
  const fontScale = FONT_SCALE[settings.fontSize] ?? 1;

  // notifications based on deadlines
  const notifications: Notification[] = [];
  if (settings.notificationsEnabled) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    tasks.forEach((t) => {
      if (t.column === "done") return;
      const dl = new Date(t.deadline);
      dl.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        const type: "urgent" | "warning" | "info" = diffDays <= 0 ? "urgent" : diffDays <= 1 ? "warning" : "info";
        const message =
          diffDays <= 0
            ? "Просрочен дедлайн: " + t.title
            : diffDays === 1
            ? "Дедлайн завтра: " + t.title
            : "Дедлайн через " + diffDays + " дн.: " + t.title;
        notifications.push({ id: "notif_" + t.id, taskId: t.id, message, type, read: false });
      }
    });
  }

  const moveTask = useCallback((taskId: string, toColumn: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              column: toColumn as Task["column"],
              progress: toColumn === "done" ? 100 : t.progress,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    // console.log('moved task', taskId, 'to', toColumn);
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setTasks((prev) => [...prev, { ...task, id: uid("t"), createdAt: now, updatedAt: now }]);
  }, []);

  const updateTask = useCallback((taskId: string, partial: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // helper to reset all tasks — not used but keeping
  function resetAllTasks() {
    setTasks(DEMO_TASKS);
  }

  const addProject = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    // rotate colors based on current project count
    setProjects((prev) => [
      ...prev,
      { id: generateId("proj"), name: trimmed, color: colors[prev.length % colors.length] },
    ]);
  }, []);

  const addMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      { id: uid("m"), from: "Вы", text: text.trim(), at: Date.now() },
      ...prev,
    ]);
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    setReminders((prev) => [...prev, { ...reminder, id: uid("r"), createdAt: now }]);
  }, []);

  const updateReminder = useCallback((reminderId: string, partial: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, ...partial } : r))
    );
  }, []);

  const deleteReminder = useCallback((reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    // TODO: implement properly, currently no-op
    // setNotifications(prev => prev.filter(n => n.id !== id));
    // console.log('dismiss notif:', id);
  }, []);

  // temp state for modal — maybe move to separate context later
  const [tempModalState, setTempModalState] = useState<Record<string, any>>({});

  const value: KanbanContextValue = {
    tasks,
    setTasks,
    projects,
    addProject,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    settings,
    setSettings,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    accentColorHex,
    fontScale,
    notifications,
    dismissNotification,
    messages,
    addMessage,
    sidebarOpen,
    setSidebarOpen,
    reminderModalOpen,
    setReminderModalOpen,
    editingReminder,
    setEditingReminder,
    tempValue: "",
    tempModalState,
    setTempModalState,
  };

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error("useKanban must be used within KanbanProvider");
  return ctx;
}

export { KanbanProvider, DEFAULT_SETTINGS, DEMO_TASKS, DEMO_PROJECTS };
