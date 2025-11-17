"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useParams } from "next/navigation"
import { getLocale, t } from "@lib/util/translations"
import { type Locale } from "@/i18n/locale"
import { useEffect, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  locale: Locale
}

const Login = ({ setCurrentView, locale: initialLocale }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  
  // Use server-provided locale initially, then sync with client-side locale after hydration
  const [locale, setLocale] = useState<Locale>(initialLocale)
  
  useEffect(() => {
    // After hydration, update to client-side locale (which respects cookie)
    const clientLocale = getLocale(countryCode)
    setLocale(clientLocale)
  }, [countryCode])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">{t("auth.welcomeBack", locale)}</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        {t("auth.signInDescription", locale)}
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("auth.email", locale)}
            name="email"
            type="email"
            title={t("auth.enterValidEmail", locale)}
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={t("auth.password", locale)}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {t("auth.signIn", locale)}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t("auth.notMember", locale)}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {t("auth.joinUs", locale)}
        </button>
        .
      </span>
    </div>
  )
}

export default Login
