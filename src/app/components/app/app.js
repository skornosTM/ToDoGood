"use client"

import Active_field_tasks from "../active_field_tasks/active_field_tasks"
import Active_field_profile from "../active_field_profile/active_field_profile"
import Active_field_settings from "../active_field_settings/active_field_settings"
import { useApp } from "../context/app_context"
import { User, LayoutGrid, Settings, LogOut } from "lucide-react"
import "./app.css"

function Map() {
  const { panel, setPanel, setProfileOpen, logout } = useApp()
  return (
    <div className="map_field">
      <div className="default_map">
        <img id="PixelDoneIcon" src="./PixelDoneIcon.svg" alt="icon" />
        <button
          className={`map_buttoon ${panel === "profile" ? "is-active" : ""}`}
          onClick={() => setProfileOpen(true)}
          title="Profile"
        >
          <User size={20} />
        </button>
        <button
          className={`map_buttoon ${panel === "tasks" ? "is-active" : ""}`}
          onClick={() => setPanel("tasks")}
          title="Tasks"
        >
          <LayoutGrid size={20} />
        </button>
        <button
          className={`map_buttoon ${panel === "settings" ? "is-active" : ""}`}
          onClick={() => setPanel("settings")}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
      <button className="map_buttoon" onClick={logout} title="Logout">
        <LogOut size={20} />
      </button>
    </div>
  )
}

export default function App() {
  const { panel, profileOpen } = useApp()
  return (
    <div className="backgraund_field">
      <Map />
      <div className="active_field">
        {panel === "tasks" && <Active_field_tasks />}
        {panel === "settings" && <Active_field_settings />}
        {profileOpen && <Active_field_profile />}
      </div>
    </div>
  )
}
