import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  toast,
} from "@medusajs/ui"
import { CogSixTooth } from "@medusajs/icons"

type InvoiceSettings = {
  companyName: string
  eik: string
  vatNumber: string
  mol: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  email: string
  bankName: string
  iban: string
  bic: string
  invoiceNumberPrefix: string
  nextInvoiceNumber: number
  invoiceNumberPadding: number
  defaultVatRate: number
  defaultCurrency: string
  logoUrl: string
  footerNote: string
}

const DEFAULT_SETTINGS: InvoiceSettings = {
  companyName: "",
  eik: "",
  vatNumber: "",
  mol: "",
  address: "",
  city: "",
  postalCode: "",
  country: "България",
  phone: "",
  email: "",
  bankName: "",
  iban: "",
  bic: "",
  invoiceNumberPrefix: "",
  nextInvoiceNumber: 1,
  invoiceNumberPadding: 10,
  defaultVatRate: 20,
  defaultCurrency: "EUR",
  logoUrl: "",
  footerNote: "",
}

const InvoiceSettingsPage = () => {
  const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/admin/invoice/settings", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      }
    } catch {
      toast.error("Грешка при зареждане на настройките")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/admin/invoice/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Настройките са запазени успешно")
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        }
      } else {
        toast.error(data.message || "Грешка при запазване")
      }
    } catch {
      toast.error("Грешка при запазване на настройките")
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = <K extends keyof InvoiceSettings>(
    field: K,
    value: InvoiceSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <Container className="p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-ui-border-base border-t-ui-fg-base rounded-full" />
          <Text>Зареждане на настройките...</Text>
        </div>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Heading level="h1" className="text-2xl mb-2">
              Настройки на фактури
            </Heading>
            <Text className="text-ui-fg-subtle">
              Данни за фирмата, банкова информация и номерация на фактурите.
            </Text>
          </div>
          <Button onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
            Запази настройките
          </Button>
        </div>
      </Container>

      {/* Company Info */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Данни за фирмата (продавач)
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Тези данни ще се отпечатват като продавач на всяка фактура.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName" className="font-medium">
              Наименование на фирмата
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Bijou Coquettee ЕООД"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="eik" className="font-medium">
              ЕИК / Булстат
            </Label>
            <Input
              id="eik"
              value={settings.eik}
              onChange={(e) => updateField("eik", e.target.value)}
              placeholder="123456789"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="vatNumber" className="font-medium">
              ДДС номер (ако е регистрирана по ЗДДС)
            </Label>
            <Input
              id="vatNumber"
              value={settings.vatNumber}
              onChange={(e) => updateField("vatNumber", e.target.value)}
              placeholder="BG123456789"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mol" className="font-medium">
              МОЛ (материално отговорно лице)
            </Label>
            <Input
              id="mol"
              value={settings.mol}
              onChange={(e) => updateField("mol", e.target.value)}
              placeholder="Име Фамилия"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="address" className="font-medium">
              Адрес на управление
            </Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="ул. Примерна 1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city" className="font-medium">
              Град
            </Label>
            <Input
              id="city"
              value={settings.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="София"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="postalCode" className="font-medium">
              Пощенски код
            </Label>
            <Input
              id="postalCode"
              value={settings.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="1000"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="font-medium">
              Телефон
            </Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+359 88 123 4567"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-medium">
              Имейл
            </Label>
            <Input
              id="email"
              value={settings.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="office@bijou-coquettee.com"
            />
          </div>
        </div>
      </Container>

      {/* Bank Details */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Банкова информация
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Банковата сметка за получаване на плащания (отпечатва се на фактурата).
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bankName" className="font-medium">
              Банка
            </Label>
            <Input
              id="bankName"
              value={settings.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              placeholder="Уникредит Булбанк"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bic" className="font-medium">
              BIC код
            </Label>
            <Input
              id="bic"
              value={settings.bic}
              onChange={(e) => updateField("bic", e.target.value)}
              placeholder="UNCRBGSF"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="iban" className="font-medium">
              IBAN
            </Label>
            <Input
              id="iban"
              value={settings.iban}
              onChange={(e) => updateField("iban", e.target.value)}
              placeholder="BG00UNCR00000000000000"
            />
          </div>
        </div>
      </Container>

      {/* Invoice Numbering */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Номерация на фактурите
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Поредният номер се увеличава автоматично при всяка нова фактура.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceNumberPrefix" className="font-medium">
              Префикс (незадължително)
            </Label>
            <Input
              id="invoiceNumberPrefix"
              value={settings.invoiceNumberPrefix}
              onChange={(e) =>
                updateField("invoiceNumberPrefix", e.target.value)
              }
              placeholder="напр. F"
            />
            <Text className="text-ui-fg-muted text-xs">
              Добавя се пред номера, напр. F0000000001
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nextInvoiceNumber" className="font-medium">
              Следващ номер
            </Label>
            <Input
              id="nextInvoiceNumber"
              type="number"
              min={1}
              value={settings.nextInvoiceNumber}
              onChange={(e) =>
                updateField(
                  "nextInvoiceNumber",
                  parseInt(e.target.value) || 1
                )
              }
            />
            <Text className="text-ui-fg-muted text-xs">
              Номерът на следващата фактура
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceNumberPadding" className="font-medium">
              Дължина на номера (цифри)
            </Label>
            <Input
              id="invoiceNumberPadding"
              type="number"
              min={1}
              max={15}
              value={settings.invoiceNumberPadding}
              onChange={(e) =>
                updateField(
                  "invoiceNumberPadding",
                  parseInt(e.target.value) || 10
                )
              }
            />
            <Text className="text-ui-fg-muted text-xs">
              Допълва с нули отпред, напр. 10 = 0000000001
            </Text>
          </div>
        </div>
      </Container>

      {/* Defaults */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Настройки по подразбиране
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Стойности по подразбиране при създаване на нова фактура.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label className="font-medium">ДДС ставка по подразбиране</Label>
            <Select
              value={String(settings.defaultVatRate)}
              onValueChange={(v) => updateField("defaultVatRate", Number(v))}
            >
              <Select.Trigger>
                <Select.Value placeholder="Изберете ставка" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="20">20% (стандартна)</Select.Item>
                <Select.Item value="9">9% (намалена)</Select.Item>
                <Select.Item value="0">0% (освободена)</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-medium">Валута по подразбиране</Label>
            <Select
              value={settings.defaultCurrency}
              onValueChange={(v) => updateField("defaultCurrency", v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Изберете валута" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="BGN">BGN (лв.)</Select.Item>
                <Select.Item value="EUR">EUR (евро)</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="footerNote" className="font-medium">
              Бележка в долната част на фактурата (незадължително)
            </Label>
            <Input
              id="footerNote"
              value={settings.footerNote}
              onChange={(e) => updateField("footerNote", e.target.value)}
              placeholder="напр. Благодарим Ви за покупката!"
            />
          </div>
        </div>
      </Container>

      {/* Bottom Save */}
      <Container className="p-8">
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving}>
            Запази настройките
          </Button>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Настройки фактури",
  icon: CogSixTooth,
})

export default InvoiceSettingsPage
