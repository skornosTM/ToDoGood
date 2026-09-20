"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Tag, Clock } from "lucide-react";
import { useKanban } from "../context/kanban_context";
import type { Reminder, Priority, Project } from "../types";
import { t, translations } from "../translations";
// import { cn } from '@/lib/utils';

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  editingReminder?: Reminder | null;
}

export default function ReminderModal({ open, onClose, editingReminder }: ReminderModalProps) {
  const ctx = useKanban();
  const { settings, addReminder, updateReminder, deleteReminder, projects, accentColorHex } = ctx;
  const lang = settings.language;

  const isNight = settings.theme === "night";
  const bgOverlay = isNight ? "bg-black/60" : "bg-black/30";
  const bgPanel = isNight ? "bg-[#1a1c24]" : "bg-white";
  const bgInput = isNight ? "bg-[#12141a]" : "bg-[#f6f7fa]";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title);
      setDescription(editingReminder.description || "");
      setDeadline(editingReminder.deadline);
      setTaskTitle(editingReminder.taskTitle || "");
      setProject(editingReminder.project || projects[0]?.name || "");
      setPriority(editingReminder.priority);
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
      setTaskTitle("");
      setProject(projects[0]?.name || "");
      setPriority("medium");
    }
  }, [editingReminder, open, projects]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    // console.log('reminder submit:', title);

    if (editingReminder) {
      updateReminder(editingReminder.id, {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline || new Date().toISOString().slice(0, 10),
        taskTitle: taskTitle.trim() || undefined,
        project: project || undefined,
        priority,
      });
    } else {
      addReminder({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline || new Date().toISOString().slice(0, 10),
        taskTitle: taskTitle.trim() || undefined,
        project: project || undefined,
        priority,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingReminder) {
      deleteReminder(editingReminder.id);
      onClose();
    }
  };

  // date formatter — same as TaskCard
  function fmtDate(dateStr: string) {
    const d = new Date(dateStr);
    const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    return d.getDate() + " " + months[d.getMonth()];
  }

  if (!open) return null;

  const inputClass = `w-full text-xs px-3 py-2.5 rounded-lg border ${bgInput} ${textPrimary} ${border} focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`;
  const labelClass = `text-[11px] font-semibold ${muted} mb-1.5 block uppercase tracking-wider`;

  // modal max height — hardcoded
  const MODAL_MAX_H = '85vh';

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center ${bgOverlay}`} onClick={onClose}>
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${bgPanel}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: MODAL_MAX_H }}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <h3 className={`text-base font-bold ${textPrimary}`}>
            {editingReminder ? t("reminder_edit_title", lang) : t("reminder_new_title", lang)}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-[var(--line)] transition-colors ${muted}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className={labelClass}>
              <Tag size={11} className="inline mr-1" />
              {t("reminder_form_title", lang)}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("reminder_form_title_placeholder", lang)}
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("reminder_form_description", lang)}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("reminder_form_desc_placeholder", lang)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Clock size={11} className="inline mr-1" />
                {t("reminder_form_deadline", lang)}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("reminder_form_priority", lang)}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={inputClass}
              >
                <option value="low">{t("task_priority_low", lang)}</option>
                <option value="medium">{t("task_priority_medium", lang)}</option>
                <option value="high">{t("task_priority_high", lang)}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Calendar size={11} className="inline mr-1" />
                {t("reminder_form_task_title", lang)}
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={t("reminder_form_task_placeholder", lang)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Tag size={11} className="inline mr-1" />
                {t("reminder_form_project", lang)}
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={inputClass}
              >
                {projects.map((p: Project) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between px-6 py-4 border-t ${border}`}>
          <button
            onClick={handleDelete}
            disabled={!editingReminder}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
              editingReminder
                ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                : border + " " + muted + " opacity-40 cursor-not-allowed"
            }`}
          >
            {t("reminder_delete", lang)}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-lg border ${border} ${muted} hover:bg-[var(--line)] transition-colors`}
            >
              {t("task_cancel", lang)}
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-xs font-bold rounded-lg text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: accentColorHex }}
            >
              {editingReminder ? t("reminder_save", lang) : t("reminder_add", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
