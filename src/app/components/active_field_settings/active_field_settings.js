"use client"

import { useState } from "react"
import { useApp, defaultSettings } from "../context/app_context"
import "./active_field_settings.css"

const sections = [
  { id: "appearance", label: "Appearance" },
  { id: "board", label: "Board" },
  { id: "motion", label: "Motion" },
  { id: "data", label: "Data" },
]

function Slider({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <label className="set-slider">
      <span>
        {label}
        <b>
          {value}
          {unit}
        </b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="set-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  )
}

export default function Active_field_settings() {
  const { settings, patchSettings, resetSettings, restoreDemo } = useApp()
  const [section, setSection] = useState("appearance")

  return (
    <div className="app_active_field_settings">
      <div className="map_active_field_settings">
        <div className="active_field_settings_project">
          <p>SETTINGS</p>
        </div>
        <nav className="set-nav">
          {sections.map((s) => (
            <button key={s.id} className={section === s.id ? "is-on" : ""} onClick={() => setSection(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="setting_active_field_settings">
        <div className="active_field_settings_project">
          <p>{sections.find((s) => s.id === section)?.label}</p>
        </div>

        {section === "appearance" && (
          <div className="set-panel">
            <div className="set-block">
              <h4>Accent color</h4>
              <p className="set-hint">Только три фиксированных цвета, без палитры</p>
              <div className="color-picks">
                {[
                  { id: "green", label: "Зелёный" },
                  { id: "red", label: "Красный" },
                  { id: "blue", label: "Синий" },
                ].map((c) => (
                  <button
                    key={c.id}
                    className={`color-pick color-${c.id} ${settings.accent === c.id ? "is-on" : ""}`}
                    onClick={() => patchSettings({ accent: c.id })}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="set-block">
              <h4>Режим</h4>
              <div className="color-picks">
                <button
                  className={settings.theme === "day" ? "is-on" : ""}
                  onClick={() => patchSettings({ theme: "day" })}
                >
                  Дневной
                </button>
                <button
                  className={settings.theme === "night" ? "is-on" : ""}
                  onClick={() => patchSettings({ theme: "night" })}
                >
                  Ночной
                </button>
              </div>
            </div>
            <Slider label="Свечение" value={settings.glow} min={0} max={40} step={1} unit="px" onChange={(v) => patchSettings({ glow: v })} />
            <Slider label="Скругление" value={settings.radius} min={0} max={32} step={1} unit="px" onChange={(v) => patchSettings({ radius: v })} />
            <Slider label="Толщина обводки" value={settings.borderWidth} min={1} max={4} step={0.5} unit="px" onChange={(v) => patchSettings({ borderWidth: v })} />
            <Slider label="Масштаб шрифта" value={settings.fontScale} min={0.75} max={1.4} step={0.01} onChange={(v) => patchSettings({ fontScale: v })} />
            <Slider label="Прозрачность второстепенного текста" value={settings.mutedOpacity} min={0.3} max={1} step={0.01} onChange={(v) => patchSettings({ mutedOpacity: v })} />
            <Slider label="Ширина боковой панели" value={settings.sidebarPercent} min={14} max={28} step={0.5} unit="%" onChange={(v) => patchSettings({ sidebarPercent: v })} />
            <Toggle label="Высокий контраст" checked={settings.highContrast} onChange={(v) => patchSettings({ highContrast: v })} />
            <Toggle label="Тень карточек" checked={settings.cardShadow} onChange={(v) => patchSettings({ cardShadow: v })} />
          </div>
        )}

        {section === "board" && (
          <div className="set-panel">
            <Slider label="Отступ внутри карточки" value={settings.cardPadding} min={8} max={28} step={1} unit="px" onChange={(v) => patchSettings({ cardPadding: v })} />
            <Slider label="Расстояние между колонками" value={settings.columnGap} min={8} max={36} step={1} unit="px" onChange={(v) => patchSettings({ columnGap: v })} />
            <Toggle label="Компактные карточки" checked={settings.compact} onChange={(v) => patchSettings({ compact: v })} />
            <Toggle label="Показывать прогресс" checked={settings.showProgress} onChange={(v) => patchSettings({ showProgress: v })} />
            <Toggle label="Показывать аватары" checked={settings.showAvatars} onChange={(v) => patchSettings({ showAvatars: v })} />
            <Toggle label="Комментарии и вложения" checked={settings.showMeta} onChange={(v) => patchSettings({ showMeta: v })} />
            <Toggle label="Даты на карточках" checked={settings.showDates} onChange={(v) => patchSettings({ showDates: v })} />
            <Toggle label="Приоритет" checked={settings.showPriority} onChange={(v) => patchSettings({ showPriority: v })} />
            <Toggle label="Цвета статуса (оранж/розовый/зелёный)" checked={settings.statusColors} onChange={(v) => patchSettings({ statusColors: v })} />
            <Toggle label="Эмодзи в приветствии" checked={settings.greetEmoji} onChange={(v) => patchSettings({ greetEmoji: v })} />
            <label className="set-select">
              Формат даты
              <select value={settings.dateFormat} onChange={(e) => patchSettings({ dateFormat: e.target.value })}>
                <option value="dd mmm">24 May</option>
                <option value="dd.mm.yyyy">24.05.2022</option>
                <option value="yyyy-mm-dd">2022-05-24</option>
              </select>
            </label>
            <label className="set-select">
              Сортировка по умолчанию
              <select value={settings.defaultSort} onChange={(e) => patchSettings({ defaultSort: e.target.value })}>
                <option value="date">date</option>
                <option value="title">title</option>
                <option value="progress">progress</option>
                <option value="priority">priority</option>
              </select>
            </label>
          </div>
        )}

        {section === "motion" && (
          <div className="set-panel">
            <Toggle label="Анимации" checked={settings.animations} onChange={(v) => patchSettings({ animations: v })} />
            <Slider
              label="Длительность анимации"
              value={settings.animationMs}
              min={0}
              max={500}
              step={10}
              unit="ms"
              onChange={(v) => patchSettings({ animationMs: v })}
            />
            <p className="set-hint">Меньше значение — чувствительнее отклик интерфейса.</p>
          </div>
        )}

        {section === "data" && (
          <div className="set-panel">
            <p className="set-hint">Локальные данные хранятся в браузере. Демо-доска повторяет карточки с макета.</p>
            <div className="set-actions">
              <button onClick={restoreDemo}>Восстановить демо-задачи</button>
              <button onClick={resetSettings}>Сбросить настройки</button>
              <button
                onClick={() => {
                  localStorage.removeItem("pixeldone_app_v1")
                  resetSettings()
                  restoreDemo()
                }}
              >
                Полный сброс вида
              </button>
            </div>
            <pre className="set-json">{JSON.stringify({ ...defaultSettings, ...settings }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
