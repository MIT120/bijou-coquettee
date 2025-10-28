import { convertToLocale } from "./money"

type FormatAmountParams = {
    amount: number
    region: {
        currency_code: string
    }
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}

export const formatAmount = ({
    amount,
    region,
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
}: FormatAmountParams) => {
    return convertToLocale({
        amount,
        currency_code: region.currency_code,
        locale,
        minimumFractionDigits,
        maximumFractionDigits,
    })
}
