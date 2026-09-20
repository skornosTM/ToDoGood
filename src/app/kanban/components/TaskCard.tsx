"use client";

import React from "react";
import {
  Calendar,
  MessageSquare,
  FileText,
  Trash2,
  GripVertical,
  Edit2,
} from "lucide-react";
// import { format } from 'date-fns'; // switched to manual formatting
import { useKanban } from "../context/kanban_context";
import type { Task } from "../types";

// month names — DRY violation but simple
const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const ctx = useKanban();
  const { settings, deleteTask, accentColorHex, fontScale } = ctx;

  const isNight = settings.theme === "night";
  const bgCard = isNight ? "bg-[#20222a]" : "bg-white";
  const bgSoft = isNight ? "bg-[#1c1e26]" : "bg-[#f5f6f8]";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#30363e]" : "border-[#e5e7eb]";

  const borderClass = settings.showDashedGrid
    ? "border-2 border-dashed border-[var(--line)]"
    : border;

  function isOverdue() {
    if (task.column === "done") return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(task.deadline);
    dl.setHours(0, 0, 0, 0);
    return dl < now;
  }

  function isDueSoon() {
    if (task.column === "done") return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(task.deadline);
    dl.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    // same logic as MONTHS constant above — lazy to refactor
    const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    // можно улучшить с date-fns, но и так работает
    return d.getDate() + " " + months[d.getMonth()];
  }

  // inline style for priority dot — was using Tailwind but colors don't match
  const priorityDotStyle: React.CSSProperties = {
    backgroundColor: task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#facc15" : "#6b7280",
  };

  const overdue = isOverdue();
  const dueSoon = isDueSoon();

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        (e.dataTransfer as any).setData("taskId", task.id);
        (e.dataTransfer as any).setData("taskTitle", task.title);
      }}
      className={`${bgCard} rounded-xl ${borderClass} p-4 transition-all duration-200 hover:shadow-lg cursor-grab group active:cursor-grabbing`}
      style={{ fontSize: fontScale + "rem" }}
    >
      <div className="flex items-start gap-2 mb-3">
        <GripVertical size={14} className={muted + " mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={priorityDotStyle} />
            <h4 className={`font-semibold text-sm leading-tight truncate ${textPrimary}`}>{task.title}</h4>
          </div>
          {task.description && (
            <p className={`text-xs ${muted} leading-relaxed line-clamp-2`}>{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-[var(--line)] transition-colors">
            <Edit2 size={12} className={muted} />
          </button>
          <button
            onClick={() => {
              // console.log('delete task:', task.id);
              deleteTask(task.id);
            }}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>

      {task.assignees.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {task.assignees.map((a: string, i: number) => (
            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${bgSoft} ${textPrimary}`}>
              {a}
            </span>
          ))}
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] ${muted} font-medium`}>Прогресс</span>
          <span style={{ color: accentColorHex }} className="text-[10px] font-bold">{task.progress}%</span>
        </div>
        <div className={`h-1.5 rounded-full overflow-hidden ${bgSoft}`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: task.progress + "%",
              background: "linear-gradient(to right, #f97316, " + accentColorHex + ")",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${bgSoft} ${
          overdue ? "text-red-400" : dueSoon ? "text-yellow-400" : muted
        }`}>
          <Calendar size={11} />
          {formatDate(task.deadline)}
        </div>
        <div className="flex items-center gap-2">
          {task.comments > 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] ${muted}`}>
              <MessageSquare size={11} /> {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className={`flex items-center gap-0.5 text-[10px] ${muted}`}>
              <FileText size={11} /> {task.attachments}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${bgSoft} ${muted}`}>
          {task.project}
        </span>
      </div>
    </div>
  );
}
