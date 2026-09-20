"use client";

import React, { useState } from "react";
import {
  LayoutList,
  Folder,
  Filter,
  Bell,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Send,
} from "lucide-react";
import { useKanban } from "../context/kanban_context";
import type { Notification, Message, Task } from "../types";

export default function Sidebar() {
  const ctx = useKanban();
  const {
    settings, setSettings, projects, addProject,
    messages, addMessage, tasks, notifications,
    sidebarOpen, setSidebarOpen, accentColorHex,
  } = ctx;

  const [newProject, setNewProject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeSection, setActiveSection] = useState("projects");

  // sidebar width — hardcoded
  const SIDEBAR_WIDTH_CLOSED = 0;
  const SIDEBAR_WIDTH_OPEN = 288; // w-72

  const isNight = settings.theme === "night";
  const bgSidebar = isNight ? "bg-[#12141a]" : "bg-[#f6f7fa]";
  const bgCard = isNight ? "bg-[#1a1c24]" : "bg-white";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]";

  // get unique project names from tasks
  const taskProjects: string[] = [];
  const projectSet = new Set<string>();
  for (const t of tasks) {
    if (!projectSet.has(t.project)) {
      projectSet.add(t.project);
      taskProjects.push(t.project);
    }
  }

  const handleAddProject = () => {
    if (newProject.trim()) {
      addProject(newProject);
      setNewProject("");
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      addMessage(messageText);
      setMessageText("");
      // console.log('sent:', messageText);
    }
  };

  const deadlineOptions = [
    { value: "all", label: "Все сроки" },
    { value: "overdue", label: "Просроченные" },
    { value: "today", label: "Сегодня" },
    { value: "week", label: "Эта неделя" },
    { value: "month", label: "Этот месяц" },
  ];

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ${bgSidebar} border-r ${border} ${
        sidebarOpen ? "w-72" : "w-0"
      } overflow-hidden`}
      style={{ minWidth: sidebarOpen ? '18rem' : '0px' }}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b ${border}`}>
        <div className="flex items-center gap-2">
          <LayoutList size={18} className="text-[var(--accent)]" />
          <span className={`text-sm font-bold ${textPrimary}`}>Kanban Board</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className={`p-1.5 rounded-lg hover:bg-[var(--line)] transition-colors ${muted}`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className={`flex border-b ${border}`}>
        {["projects", "filters", "reminders", "messages"].map((section) => {
          const icons: Record<string, React.ReactNode> = {
            projects: <Folder size={14} />,
            filters: <Filter size={14} />,
            reminders: <Bell size={14} />,
            messages: <MessageCircle size={14} />,
          };
          const labels: Record<string, string> = {
            projects: "Проекты",
            filters: "Фильтры",
            reminders: "Напоминания",
            messages: "Чат",
          };
          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
                activeSection === section
                  ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                  : muted
              }`}
            >
              {icons[section]}
              <span className="hidden lg:inline">{labels[section]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeSection === "projects" && (
          <>
            <div className="space-y-1">
              <button
                onClick={() => setSettings({ ...settings, filterProject: "all" })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  settings.filterProject === "all" ? "text-white" : textPrimary + " hover:bg-[var(--line)]"
                }`}
                style={settings.filterProject === "all" ? { backgroundColor: accentColorHex } : {}}
              >
                <Folder size={14} />
                Все проекты
                <span className={`ml-auto text-[10px] ${settings.filterProject === "all" ? "text-white/70" : muted}`}>
                  {tasks.length}
                </span>
              </button>
              {taskProjects.map((p: string) => (
                <button
                  key={p}
                  onClick={() => setSettings({ ...settings, filterProject: p })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    settings.filterProject === p ? "text-white" : textPrimary + " hover:bg-[var(--line)]"
                  }`}
                  style={settings.filterProject === p ? { backgroundColor: accentColorHex } : {}}
                >
                  <Folder size={14} />
                  {p}
                  <span className={`ml-auto text-[10px] ${settings.filterProject === p ? "text-white/70" : muted}`}>
                    {tasks.filter((t: Task) => t.project === p).length}
                  </span>
                </button>
              ))}
            </div>

            <div className={`flex gap-2 pt-2 border-t ${border}`}>
              <input
                type="text"
                placeholder="Новый проект..."
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                className={`flex-1 text-xs px-3 py-2 rounded-lg border ${bgCard} ${textPrimary} ${border} focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`}
              />
              <button
                onClick={handleAddProject}
                className="p-2 rounded-lg text-white transition-colors hover:opacity-80"
                style={{ backgroundColor: accentColorHex }}
              >
                <Plus size={14} />
              </button>
            </div>
          </>
        )}

        {activeSection === "filters" && (
          <>
            <div>
              <label className={`text-[11px] font-semibold ${muted} mb-2 block uppercase tracking-wider`}>
                Статус
              </label>
              <div className="space-y-1">
                {(["todo", "inprogress", "done"] as const).map((col: string) => {
                  const labels: Record<string, string> = { todo: "To Do", inprogress: "In Progress", done: "Done" };
                  const count = tasks.filter((t: Task) => t.column === col).length;
                  return (
                    <div key={col} className={`flex items-center justify-between px-3 py-2 rounded-lg ${bgCard}`}>
                      <span className={`text-xs ${textPrimary}`}>{labels[col]}</span>
                      <span className={`text-[10px] font-bold ${muted}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`text-[11px] font-semibold ${muted} mb-2 block uppercase tracking-wider`}>
                Дедлайн
              </label>
              <div className="space-y-1">
                {deadlineOptions.map((opt: { value: string; label: string }) => (
                  <button
                    key={opt.value}
                    onClick={() => setSettings({ ...settings, filterDeadline: opt.value as any })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      settings.filterDeadline === opt.value
                        ? "text-white"
                        : textPrimary + " hover:bg-[var(--line)]"
                    }`}
                    style={settings.filterDeadline === opt.value ? { backgroundColor: accentColorHex } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[11px] font-semibold ${muted} mb-2 block uppercase tracking-wider`}>
                Сортировка
              </label>
              <div className="space-y-1">
                {[
                  { value: "deadline", label: "По дедлайну" },
                  { value: "progress", label: "По прогрессу" },
                  { value: "priority", label: "По приоритету" },
                  { value: "title", label: "По названию" },
                ].map((opt: { value: string; label: string }) => (
                  <button
                    key={opt.value}
                    onClick={() => setSettings({ ...settings, sortBy: opt.value as any })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      settings.sortBy === opt.value
                        ? "text-white"
                        : textPrimary + " hover:bg-[var(--line)]"
                    }`}
                    style={settings.sortBy === opt.value ? { backgroundColor: accentColorHex } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === "reminders" && (
          <>
            {notifications.length === 0 ? (
              <div className={`text-center py-8 ${muted}`}>
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">Нет напоминаний</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2.5 rounded-lg border ${border} ${bgCard} ${
                      n.type === "urgent" ? "border-red-500/30" : "border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "urgent" ? "bg-red-500" : "bg-yellow-500"}`} />
                      <p className={`text-xs leading-relaxed ${textPrimary}`}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === "messages" && (
          <>
            <div className="space-y-3 max-h-[256px] overflow-y-auto">
              {messages.map((msg: Message) => (
                <div key={msg.id} className={`${bgCard} rounded-lg px-3 py-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold`} style={{ color: accentColorHex }}>{msg.from}</span>
                    <span className={`text-[9px] ${muted}`}>
                      {new Date(msg.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className={`text-xs ${textPrimary}`}>{msg.text}</p>
                </div>
              ))}
            </div>

            <div className={`flex gap-2 pt-2 border-t ${border}`}>
              <input
                type="text"
                placeholder="Написать сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className={`flex-1 text-xs px-3 py-2 rounded-lg border ${bgCard} ${textPrimary} ${border} focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-lg text-white transition-colors hover:opacity-80"
                style={{ backgroundColor: accentColorHex }}
              >
                <Send size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`px-4 py-3 border-t ${border}`}>
        <div className={`flex rounded-lg overflow-hidden border ${border}`}>
          <button
            onClick={() => setSettings({ ...settings, theme: "day" })}
            className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              settings.theme === "day" ? "text-white" : muted + " hover:bg-[var(--line)]"
            }`}
            style={settings.theme === "day" ? { backgroundColor: accentColorHex } : {}}
          >
            <Sun size={13} /> День
          </button>
          <button
            onClick={() => setSettings({ ...settings, theme: "night" })}
            className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              settings.theme === "night" ? "text-white" : muted + " hover:bg-[var(--line)]"
            }`}
            style={settings.theme === "night" ? { backgroundColor: accentColorHex } : {}}
          >
            <Moon size={13} /> Ночь
          </button>
        </div>
      </div>
    </div>
  );
}
