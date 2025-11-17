import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { getServerLocale } from "@lib/util/translations-server"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Bijou Coquettee account.",
}

export default async function Login(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const locale = await getServerLocale(params.countryCode)
  
  return <LoginTemplate locale={locale} />
}
