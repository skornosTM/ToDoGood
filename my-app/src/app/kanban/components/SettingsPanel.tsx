"use client";

import React, { useState } from "react";
import { Settings, Moon, Sun, Palette, Bell, Type, X } from "lucide-react";
import { useKanban } from "../context/kanban_context";

export default function SettingsPanel() {
  const ctx = useKanban();
  const { settings, setSettings, accentColorHex } = ctx;

  const [open, setOpen] = useState(false);

  const isNight = settings.theme === "night";
  const bgPanel = isNight ? "bg-[#16181e]" : "bg-white";
  const muted = isNight ? "text-[#6b7280]" : "text-[#9ca3af]";
  const textPrimary = isNight ? "text-[#e5e7eb]" : "text-[#1f2937]";
  const border = isNight ? "border-[#2a2c36]" : "border-[#e5e7eb]";

  const accentOptions = [
    { val: "green", label: "Зелёный", hex: "#22c55e" },
    { val: "red", label: "Красный", hex: "#ef4444" },
    { val: "blue", label: "Синий", hex: "#3b82f6" },
  ];

  const fontOptions = [
    { val: "small", label: "S" },
    { val: "medium", label: "M" },
    { val: "large", label: "L" },
  ];

  function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    // inline toggle component — simple but works
    return (
      <button
        onClick={onChange}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={on ? { backgroundColor: accentColorHex } : { backgroundColor: isNight ? "#2a2c36" : "#e5e7eb" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }}
        />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-4 right-4 z-[150] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${bgPanel} border ${border}`}
        style={{ bottom: '16px', right: '16px' }}
      >
        <Settings size={18} className={muted} />
      </button>

      <div
        className={`fixed bottom-16 right-4 z-[150] w-72 rounded-2xl shadow-2xl border ${border} transition-all duration-300 origin-bottom-right ${bgPanel} ${
          open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
            <Settings size={14} />
            Настройки
          </h3>
          <button onClick={() => setOpen(false)} className={`p-1 rounded-md hover:bg-[var(--line)] transition-colors ${muted}`}>
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={`text-xs font-medium ${muted} mb-2 block flex items-center gap-1.5`}>
              <Sun size={12} />
              Тема
            </label>
            <div className={`flex rounded-lg overflow-hidden border ${border}`}>
              <button
                onClick={() => setSettings({ ...settings, theme: "day" })}
                className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                  settings.theme === "day" ? "text-white" : muted + " hover:bg-[var(--line)]"
                }`}
                style={settings.theme === "day" ? { backgroundColor: accentColorHex } : {}}
              >
                <Sun size={12} /> День
              </button>
              <button
                onClick={() => setSettings({ ...settings, theme: "night" })}
                className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                  settings.theme === "night" ? "text-white" : muted + " hover:bg-[var(--line)]"
                }`}
                style={settings.theme === "night" ? { backgroundColor: accentColorHex } : {}}
              >
                <Moon size={12} /> Ночь
              </button>
            </div>
          </div>

          <div>
            <label className={`text-xs font-medium ${muted} mb-2 block flex items-center gap-1.5`}>
              <Palette size={12} />
              Цвет акцента
            </label>
            <div className="flex gap-2">
              {accentOptions.map((c: { val: string; label: string; hex: string }) => (
                <button
                  key={c.val}
                  onClick={() => setSettings({ ...settings, accentColor: c.val as any })}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                    settings.accentColor === c.val ? "border-current scale-105" : "border-transparent hover:scale-105"
                  }`}
                  style={
                    settings.accentColor === c.val
                      ? { backgroundColor: c.hex, color: c.hex, boxShadow: "0 0 0 1px " + c.hex + "40" }
                      : {}
                  }
                >
                  <div className="w-5 h-5 rounded-full mx-auto mb-1" style={{ backgroundColor: c.hex }} />
                  <span className={settings.accentColor === c.val ? "text-white" : muted}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs font-medium ${muted} mb-2 block flex items-center gap-1.5`}>
              <Type size={12} />
              Размер шрифта
            </label>
            <div className={`flex rounded-lg overflow-hidden border ${border}`}>
              {fontOptions.map((fs: { val: string; label: string }) => (
                <button
                  key={fs.val}
                  onClick={() => setSettings({ ...settings, fontSize: fs.val as any })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    settings.fontSize === fs.val ? "text-white" : muted + " hover:bg-[var(--line)]"
                  }`}
                  style={settings.fontSize === fs.val ? { backgroundColor: accentColorHex } : {}}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={`text-xs font-medium ${muted}`}>Пунктирная сетка</label>
            <Toggle
              on={settings.showDashedGrid}
              onChange={() => setSettings({ ...settings, showDashedGrid: !settings.showDashedGrid })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className={`text-xs font-medium flex items-center gap-1.5 ${muted}`}>
              <Bell size={12} />
              Уведомления
            </label>
            <Toggle
              on={settings.notificationsEnabled}
              onChange={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
