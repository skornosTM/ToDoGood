"use client";

import { useEffect } from "react";
import { KanbanProvider, useKanban } from "./context/kanban_context";
import KanbanBoard from "./components/KanbanBoard";
import Sidebar from "./components/Sidebar";
import SettingsPanel from "./components/SettingsPanel";
import Notifications from "./components/Notifications";

function KanbanContent() {
  const ctx = useKanban();
  const { settings, accentColorHex } = ctx;

  useEffect(() => {
    const hex = accentColorHex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty("--accent", r + ", " + g + ", " + b);
  }, [accentColorHex]);

  const isNight = settings.theme === "night";
  const bgOuter = isNight ? "bg-[#1a1c23]" : "bg-[#e8e8ec]";

  return (
    <div className={`theme-root h-full flex ${bgOuter}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <KanbanBoard />
      </div>
      <SettingsPanel />
      <Notifications />
    </div>
  );
}

export default function KanbanPage() {
  return (
    <KanbanProvider>
      <KanbanContent />
    </KanbanProvider>
  );
}
