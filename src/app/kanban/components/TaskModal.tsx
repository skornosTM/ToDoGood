"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Tag, Users, FileText, MessageSquare, Clock } from "lucide-react";
import { useKanban } from "../context/kanban_context";
import type { Task, ColumnId, Priority, Project } from "../types";
// import { cn } from '@/lib/utils'; // not using clsx/tailwind-merge

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task | null;
  defaultColumn?: ColumnId;
}

export default function TaskModal({ open, onClose, editingTask, defaultColumn = "todo" }: TaskModalProps) {
  const ctx = useKanban();
  const { settings, addTask, updateTask, projects, accentColorHex } = ctx;

  const isNight = settings.theme === "night";
  const bgOverlay = isNight ? "bg-black/60" : "bg-black/30";
  const bgPanel = isNight ? "bg-[#1a1c24]" : "bg-white";
  const bgInput = isNight ? "bg-[#12141a]" : "bg-[#f6f7fa]";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState<ColumnId>(defaultColumn);
  const [progress, setProgress] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [comments, setComments] = useState(0);
  const [attachments, setAttachments] = useState(0);
  const [assignees, setAssignees] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setColumn(editingTask.column);
      setProgress(editingTask.progress);
      setDeadline(editingTask.deadline);
      setProject(editingTask.project);
      setPriority(editingTask.priority);
      setComments(editingTask.comments);
      setAttachments(editingTask.attachments);
      setAssignees(editingTask.assignees.join(", "));
    } else {
      setTitle("");
      setDescription("");
      setColumn(defaultColumn);
      setProgress(0);
      setDeadline("");
      setProject(projects[0]?.name || "");
      setPriority("medium");
      setComments(0);
      setAttachments(0);
      setAssignees("");
    }
  }, [editingTask, open, defaultColumn, projects]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const assigneeList = assignees.split(",").map((s) => s.trim()).filter(Boolean);

    // console.log('submit task:', { ...data, assignees: assigneeList });

    // validate progress
    let prog = Math.min(100, Math.max(0, progress));
    if (column === "done") prog = 100;

    const data = {
      title: title.trim(),
      description: description.trim(),
      column,
      progress: prog,
      deadline: deadline || new Date().toISOString().slice(0, 10),
      project: project || "Без проекта",
      priority,
      comments,
      attachments,
      assignees: assigneeList,
    };

    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    onClose();
  };

  if (!open) return null;

  const inputClass = `w-full text-xs px-3 py-2.5 rounded-lg border ${bgInput} ${textPrimary} ${border} focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`;
  const labelClass = `text-[11px] font-semibold ${muted} mb-1.5 block uppercase tracking-wider`;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${bgOverlay}`} onClick={onClose}>
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${bgPanel} animate-slide-in`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>
            {editingTask ? "Редактировать задачу" : "Новая задача"}
          </h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg hover:bg-[var(--line)] transition-colors ${muted}`}>
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className={labelClass}>
              <Tag size={11} className="inline mr-1" />
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи..."
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>
              <FileText size={11} className="inline mr-1" />
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите задачу..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Статус</label>
              <select value={column} onChange={(e) => setColumn(e.target.value as ColumnId)} className={inputClass}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Прогресс: {progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Clock size={11} className="inline mr-1" />
                Дедлайн
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Приоритет</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Tag size={11} className="inline mr-1" />
                Проект
              </label>
              <select value={project} onChange={(e) => setProject(e.target.value)} className={inputClass}>
                {projects.map((p: Project) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            {/* assignees field — comma-separated for simplicity */}
            <div>
              <label className={labelClass}>
                <Users size={11} className="inline mr-1" />
                Исполнители
              </label>
              <input
                type="text"
                value={assignees}
                onChange={(e) => setAssignees(e.target.value)}
                placeholder="Через запятую..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <MessageSquare size={11} className="inline mr-1" />
                Комментарии
              </label>
              <input
                type="number"
                min="0"
                value={comments}
                onChange={(e) => setComments(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <FileText size={11} className="inline mr-1" />
                Вложения
              </label>
              <input
                type="number"
                min="0"
                value={attachments}
                onChange={(e) => setAttachments(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${border}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg border ${border} ${muted} hover:bg-[var(--line)] transition-colors`}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-xs font-bold rounded-lg text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: accentColorHex }}
          >
            {editingTask ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}
