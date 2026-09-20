"use client"

import { useState, useEffect } from "react"
import { useApp } from "../context/app_context"
import { lt, legacyTranslations } from "../translations"
import "./auth.css"

export default function Auth() {
  const { register, login, authError, patchSettings } = useApp()
  const [mode, setMode] = useState("login")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [avatar, setAvatar] = useState("💚")
  const [showLangPrompt, setShowLangPrompt] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const [selectedLang, setSelectedLang] = useState("ru")

  // Check if user just registered without language preference
  useEffect(() => {
    const stored = localStorage.getItem("pixeldone_app_v1")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.user && (!data.settings || !data.settings.language)) {
          setShowLangPrompt(true)
        }
      } catch {
        // ignore
      }
    }
  }, [])

  function submit(e) {
    e.preventDefault()
    if (mode === "login") {
      login({ nickname, password })
    } else {
      const success = register({ nickname, password, avatar })
      if (success) {
        setJustRegistered(true)
        setShowLangPrompt(true)
      }
    }
  }

  function handleLangConfirm() {
    patchSettings({ language: selectedLang })
    setShowLangPrompt(false)
  }

  function handleLangSkip() {
    patchSettings({ language: "ru" })
    setShowLangPrompt(false)
  }

  const lang = (justRegistered && showLangPrompt) ? selectedLang : "ru"

  return (
    <div className="auth">
      <form className="auth_window" onSubmit={submit}>
        {mode === "login" ? (
          <div className="auth_window_authorization">
            <div className="auth_window_authorization_name">
              <div>{lt("auth_title", lang)}</div>
            </div>
            <div className="auth_window_authorization_input">
              <input placeholder={lt("auth_nickname", lang)} value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <input type="password" placeholder={lt("auth_password", lang)} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {authError && <p className="auth_error">{authError}</p>}
            <button type="submit" className="auth_window_authorization_button">{lt("auth_login_btn", lang)}</button>
            <p className="auth_window_authorization_button_transition" onClick={() => setMode("register")}>
              {lt("auth_no_account", lang)}
            </p>
          </div>
        ) : (
          <div className="auth_window_registration">
            <div className="auth_window_registration_name">
              <div>{lt("auth_register_title", lang)}</div>
              <p>{lt("auth_register_hint", lang)}</p>
              <div className="auth_window_authorization_name_photo">
                <input maxLength={2} value={avatar} onChange={(e) => setAvatar(e.target.value)} />
              </div>
            </div>
            <div className="auth_window_authorization_input">
              <input placeholder={lt("auth_nickname", lang)} value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <input type="password" placeholder={lt("auth_password", lang)} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {authError && <p className="auth_error">{authError}</p>}
            <button type="submit" className="auth_window_authorization_button">{lt("auth_register_btn", lang)}</button>
            <p className="auth_window_authorization_button_transition" onClick={() => setMode("login")}>
              {lt("auth_has_account", lang)}
            </p>
          </div>
        )}
      </form>

      {/* Language prompt overlay */}
      {showLangPrompt && (
        <div className="lang-prompt-overlay" onClick={handleLangSkip}>
          <div className="lang-prompt-card" onClick={(e) => e.stopPropagation()}>
            <div className="lang-prompt-header">
              <h3>{lt("lang_prompt_title", selectedLang)}</h3>
            </div>
            <p className="lang-prompt-question">{lt("lang_prompt_question", selectedLang)}</p>
            <div className="lang-prompt-options">
              <button
                className={`lang-option ${selectedLang === "ru" ? "selected" : ""}`}
                onClick={() => setSelectedLang("ru")}
              >
                <span className="lang-flag">🇷🇺</span>
                <span>{lt("lang_russian", selectedLang)}</span>
              </button>
              <button
                className={`lang-option ${selectedLang === "en" ? "selected" : ""}`}
                onClick={() => setSelectedLang("en")}
              >
                <span className="lang-flag">🇬🇧</span>
                <span>{lt("lang_english", selectedLang)}</span>
              </button>
            </div>
            <div className="lang-prompt-actions">
              <button className="lang-btn lang-btn-skip" onClick={handleLangSkip}>
                {lt("lang_skip", selectedLang)}
              </button>
              <button className="lang-btn lang-btn-continue" onClick={handleLangConfirm}>
                {lt("lang_continue", selectedLang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
