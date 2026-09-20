"use client"

import { AppProvider, useApp } from "./context/app_context"
import Auth from "./auth/auth"
import App from "./app/app"

function Shell() {
  const { user } = useApp()
  return user ? <App /> : <Auth />
}

export default function Providers() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
