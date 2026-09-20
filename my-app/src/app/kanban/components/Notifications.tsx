"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Clock, X, CheckCircle2 } from "lucide-react";
import { useKanban } from "../context/kanban_context";
import type { Notification } from "../types";

export default function Notifications() {
  const ctx = useKanban();
  const { notifications, settings, setSettings, dismissNotification } = ctx;

  const isNight = settings.theme === "night";
  const bgPanel = isNight ? "bg-[#16181e]" : "bg-white";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";

  if (notifications.length === 0) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      // auto dismiss after 8 seconds
      // console.log('auto-dismiss notifications');
    }, 8000);
    return () => clearTimeout(timer);
  }, [notifications]);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm" style={{ zIndex: 9999 }}>
      {notifications.map((notif: Notification) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            notif.type === "urgent"
              ? "border-red-500/30"
              : notif.type === "warning"
              ? "border-yellow-500/30"
              : "border-blue-500/30"
          } ${bgPanel} animate-slide-in`}
        >
          {notif.type === "urgent" ? (
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          ) : notif.type === "warning" ? (
            <Clock size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-xs flex-1 leading-relaxed ${textPrimary}`}>{notif.message}</p>
          <button
            onClick={() => dismissNotification(notif.id)}
            className={`p-0.5 rounded hover:bg-[var(--line)] transition-colors ${muted}`}
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {notifications.length > 0 && (
        <button
          onClick={() => setSettings({ ...settings, notificationsEnabled: false })}
          className={`text-[10px] px-3 py-1.5 rounded-lg ${bgPanel} border ${
            isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]"
          } ${muted} hover:bg-[var(--line)] transition-colors self-end`}
        >
          Отключить уведомления
        </button>
      )}
    </div>
  );
}
