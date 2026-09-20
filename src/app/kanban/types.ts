export type ColumnId = "todo" | "inprogress" | "done";
export type Priority = "low" | "medium" | "high";
export type ThemeMode = "day" | "night";
export type AccentColor = "green" | "red" | "blue";
export type FontSize = "small" | "medium" | "large";
export type SortBy = "deadline" | "progress" | "priority" | "title";
export type FilterDeadline = "all" | "overdue" | "today" | "week" | "month";
export type Language = "ru" | "en";

// TODO: maybe merge Notification and Reminder later?
// also need to add tags type but prolly later

export type TaskTag = {
  id: string;
  name: string;
  color: string;
}

// @ts-ignore - gonna use this later
// export type TaskTagList = TaskTag[];

export interface Task {
  id: string;
  title: string;
  description: string;
  column: ColumnId;
  progress: number;
  deadline: string;
  comments: number;
  attachments: number;
  project: string;
  priority: Priority;
  assignees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  deadline: string;
  taskId?: string;
  taskTitle?: string;
  project?: string;
  priority: Priority;
  createdAt: string;
}

export interface Notification {
  id: string;
  taskId: string;
  message: string;
  type: "urgent" | "warning" | "info";
  read: boolean;
}

export interface KanbanSettings {
  accentColor: AccentColor;
  theme: ThemeMode;
  showDashedGrid: boolean;
  filterProject: string;
  filterDeadline: FilterDeadline;
  sortBy: SortBy;
  notificationsEnabled: boolean;
  fontSize: FontSize;
  language: Language;
}

export interface KanbanContextValue {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projects: Project[];
  addProject: (name: string) => void;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (reminderId: string, partial: Partial<Reminder>) => void;
  deleteReminder: (reminderId: string) => void;
  settings: KanbanSettings;
  setSettings: React.Dispatch<React.SetStateAction<KanbanSettings>>;
  moveTask: (taskId: string, toColumn: ColumnId) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (taskId: string, partial: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  accentColorHex: string;
  fontScale: number;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
  messages: Message[];
  addMessage: (text: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  reminderModalOpen: boolean;
  setReminderModalOpen: (open: boolean) => void;
  editingReminder: Reminder | null;
  setEditingReminder: (r: Reminder | null) => void;
  tempValue: string;
  tempModalState: Record<string, any>;
  setTempModalState: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  at: number;
}

// old interface, keeping for ref
interface LegacyTaskData {
  taskTitle: string;
  taskDesc: string;
  taskStatus: string;
}

// export type { LegacyTaskData }; // not used
