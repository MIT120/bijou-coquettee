"use client"

import { useActionState } from "react"
import { useParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { type Locale } from "@/i18n/locale"
import { t } from "@lib/util/translations"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  locale: Locale
}

const Register = ({ setCurrentView, locale }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        {t("auth.becomeMember", locale)}
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        {t("auth.createProfileDescription", locale)}
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <input type="hidden" name="countryCode" value={countryCode ?? "bg"} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("account.firstName", locale)}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={t("account.lastName", locale)}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={t("account.email", locale)}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label={t("account.phone", locale)}
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label={t("auth.password", locale)}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          {t("auth.byCreatingAccount", locale)}{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            {t("auth.privacyPolicy", locale)}
          </LocalizedClientLink>{" "}
          {locale === "bg" ? "и" : "and"}{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            {t("auth.termsOfUse", locale)}
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {t("auth.join", locale)}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t("auth.alreadyMember", locale)}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {t("auth.signIn", locale)}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
