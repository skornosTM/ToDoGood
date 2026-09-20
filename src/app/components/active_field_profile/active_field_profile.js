"use client"

import { useApp } from "../context/app_context"
import "./active_field_profile.css"

export default function Active_field_profile() {
  const { user, progressPercent, setProfileOpen, tasks, projects } = useApp()
  const done = tasks.filter((t) => t.status === "done").length
  return (
    <div className="active_field_profile">
      <div className="active_field_profile_main">
        <div className="active_field_profile_main_avatar">
          <div className="active_field_profile_main_avatar_info">INFO</div>
          <div className="active_field_profile_main_avatar_photo">{user?.avatar || "💚"}</div>
          <div className="active_field_profile_main_avatar_name">{user?.nickname || "NAME"}</div>
        </div>
        <div className="active_field_profile_main_progress">
          <div className="active_field_profile_main_progress_name">
            <div className="active_field_profile_main_progress_name_progress">PROGRESS</div>
            <div className="active_field_profile_main_progress_name_number">{progressPercent}%</div>
          </div>
          <div className="active_field_profile_main_progress_bar">
            <div className="active_field_profile_main_progress_bar_done" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
      <div className="active_field_profile_awards">
        <div className="active_field_profile_awards_awards">AWARDS</div>
        <div className="active_field_profile_award_list">
          <ul>
            <li>Projects: {projects.length}</li>
            <li>Tasks: {tasks.length}</li>
            <li>Done: {done}</li>
            {progressPercent >= 50 && <li>Halfway badge</li>}
            {done >= 3 && <li>Closer badge</li>}
          </ul>
        </div>
      </div>
      <button className="active_field_profile_exit" onClick={() => setProfileOpen(false)}>
        ✖️
      </button>
    </div>
  )
}
