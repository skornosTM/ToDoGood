"use client";

import React, { useState, useMemo } from "react";
import {
  CirclePlus,
  LayoutList,
  CheckCircle2,
  Loader2,
  GripVertical,
  ArrowUpDown,
} from "lucide-react";
import { useKanban } from "../context/kanban_context";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import type { Task, ColumnId, SortBy } from "../types";

const COLUMNS = [
  { id: "todo" as ColumnId, title: "To Do", icon: CirclePlus, color: "text-gray-400" },
  { id: "inprogress" as ColumnId, title: "In Progress", icon: Loader2, color: "text-orange-400" },
  // done column — green
  { id: "done" as ColumnId, title: "Done", icon: CheckCircle2, color: "text-green-400" },
];

// column widths — hardcoded for now
const COL_WIDTH_MIN = 280;
const COL_WIDTH_MAX = 420;

export default function KanbanBoard() {
  const ctx = useKanban();
  const { tasks, settings, setSettings, moveTask, sidebarOpen, accentColorHex } = ctx;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumn, setDefaultColumn] = useState<ColumnId>("todo");

  const isNight = settings.theme === "night";
  const bgSoft = isNight ? "bg-[#1c1e26]" : "bg-[#f5f6f8]";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]";

  // filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: Task) => {
      if (settings.filterProject !== "all" && t.project !== settings.filterProject) return false;

      if (settings.filterDeadline !== "all") {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dl = new Date(t.deadline);
        dl.setHours(0, 0, 0, 0);
        const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (settings.filterDeadline === "overdue" && diff >= 0) return false;
        if (settings.filterDeadline === "today" && diff !== 0) return false;
        if (settings.filterDeadline === "week" && (diff < 0 || diff > 7)) return false;
        if (settings.filterDeadline === "month" && (diff < 0 || diff > 30)) return false;
      }
      return true;
    });
  }, [tasks, settings.filterProject, settings.filterDeadline]);

  // console.log('filtered:', filteredTasks.length, 'from', tasks.length); // DEBUG

  // helper to check if deadline is overdue — duplicated from TaskCard but whatever
  function isDeadlineOverdue(deadlineStr: string): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadlineStr);
    dl.setHours(0, 0, 0, 0);
    return dl < now;
  }

  // sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    if (settings.sortBy === "deadline") {
      sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (settings.sortBy === "progress") {
      sorted.sort((a, b) => a.progress - b.progress);
    } else if (settings.sortBy === "priority") {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (settings.sortBy === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    }
    // hardcode max 100 tasks for performance
    return sorted.slice(0, 100);
  }, [filteredTasks, settings.sortBy]);

  function onDrop(e: React.DragEvent, colId: ColumnId) {
    e.preventDefault();
    const id = (e.dataTransfer as any).getData("taskId");
    if (id) moveTask(id, colId);
  }

  function openAddModal(colId: ColumnId) {
    setEditingTask(null);
    setDefaultColumn(colId);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function getColumnTasks(colId: ColumnId) {
    return sortedTasks.filter((t) => t.column === colId);
  }

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between px-6 py-3 border-b ${border}`} style={{ borderTop: '3px solid var(--accent)' }}>
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => ctx.setSidebarOpen(true)}
              className={`p-2 rounded-lg hover:bg-[var(--line)] transition-colors ${muted}`}
            >
              <LayoutList size={18} />
            </button>
          )}
          <LayoutList size={20} className="text-[var(--accent)]" />
          <h2 className={`text-base font-bold ${textPrimary}`}>Kanban Board</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={12} className={muted} />
            <select
              value={settings.sortBy}
              onChange={(e) => setSettings({ ...settings, sortBy: e.target.value as SortBy })}
              className={`text-xs px-2 py-1.5 rounded-lg border ${isNight ? "bg-[#16181e]" : "bg-white"} ${muted} ${border} focus:outline-none`}
            >
              <option value="deadline">Дедлайн</option>
              <option value="progress">Прогресс</option>
              <option value="priority">Приоритет</option>
              <option value="title">Название</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
        {COLUMNS.map((col: { id: ColumnId; title: string; icon: React.FC<any>; color: string }) => {
          const colTasks = getColumnTasks(col.id);
          const Icon = col.icon;

          return (
            <div key={col.id} className="flex-1 min-w-[280px] max-w-[420px] flex flex-col">
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${bgSoft}`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className={col.color} />
                  <h3 className={`text-sm font-semibold ${textPrimary}`}>{col.title}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isNight ? "bg-[#20222a]" : "bg-white"} ${muted}`}>
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openAddModal(col.id)}
                  className={`p-1 rounded-md hover:bg-[var(--line)] transition-colors ${muted}`}
                >
                  <CirclePlus size={15} />
                </button>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, col.id)}
                className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1"
                style={{ minHeight: '100px' }}
              >
                {colTasks.map((task: Task) => (
                  <TaskCard key={task.id} task={task} onEdit={openEditModal} />
                ))}

                {colTasks.length === 0 && (
                  <div
                    className={`flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed ${
                      isNight ? "border-[#2a2c36] text-[#4a4c56]" : "border-[#e0e4ea] text-[#b0b4ba]"
                    } text-xs`}
                  >
                    <GripVertical size={20} className="mb-2 opacity-40" />
                    <p>Перетащите задачу</p>
                    <button
                      onClick={() => openAddModal(col.id)}
                      className="mt-2 text-xs px-3 py-1 rounded-lg text-white transition-opacity hover:opacity-80"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      + Добавить
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingTask={editingTask}
        defaultColumn={defaultColumn}
      />
    </div>
  );
}
