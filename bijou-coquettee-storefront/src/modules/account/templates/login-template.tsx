"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import { type Locale } from "@/i18n/locale"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = ({ locale }: { locale: Locale }) => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} locale={locale} />
      ) : (
        <Register setCurrentView={setCurrentView} locale={locale} />
      )}
    </div>
  )
}

export default LoginTemplate
