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
  Badge,
  toast,
} from "@medusajs/ui"
import { CogSixTooth } from "@medusajs/icons"

type EcontSettings = {
  apiUsername: string
  apiPassword: string
  apiBaseUrl: string
  isDemo: boolean
  senderClientNumber: string
  senderCity: string
  senderPostCode: string
  senderOfficeCode: string
  cdAgreementNum: string
  payoutMethod: "bank" | "office" | "door"
  payoutIban: string
  payoutBic: string
}

const DEFAULT_SETTINGS: EcontSettings = {
  apiUsername: "",
  apiPassword: "",
  apiBaseUrl: "https://demo.econt.com/ee/services",
  isDemo: true,
  senderClientNumber: "",
  senderCity: "",
  senderPostCode: "",
  senderOfficeCode: "",
  cdAgreementNum: "",
  payoutMethod: "bank",
  payoutIban: "",
  payoutBic: "",
}

const EcontSettingsPage = () => {
  const [settings, setSettings] = useState<EcontSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/admin/econt/settings", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      }
    } catch (err) {
      toast.error("Грешка при зареждане на настройките")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/admin/econt/settings", {
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

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      // Test by fetching cities - this uses the Econt API
      const response = await fetch(
        "/admin/econt/locations?type=city&search=София&limit=1",
        { credentials: "include" }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.locations?.length > 0) {
          toast.success(
            `Връзката с Econt API е успешна! Намерен град: ${data.locations[0].name}`
          )
        } else {
          toast.success("Връзката с Econt API е успешна (няма резултати)")
        }
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(
          `Грешка при тестване: ${(data as { message?: string }).message || response.statusText}`
        )
      }
    } catch (err) {
      toast.error("Неуспешна връзка с Econt API")
    } finally {
      setIsTesting(false)
    }
  }

  const updateField = <K extends keyof EcontSettings>(
    field: K,
    value: EcontSettings[K]
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
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-2xl mb-2">
              Econt Настройки
            </Heading>
            <Text className="text-ui-fg-subtle">
              Управление на конфигурацията за интеграция с Econt Express.
              Промените влизат в сила след рестартиране на сървъра за
              полетата за автентикация.
            </Text>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              isLoading={isTesting}
            >
              Тест на връзката
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              Запази настройките
            </Button>
          </div>
        </div>
      </Container>

      {/* API Authentication */}
      <Container className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Heading level="h2" className="text-lg">
            API Автентикация
          </Heading>
          <Badge
            color={settings.isDemo ? "orange" : "green"}
            size="small"
          >
            {settings.isDemo ? "ДЕМО РЕЖИМ" : "ПРОДУКЦИЯ"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiUsername" className="font-medium">
              API Потребителско име
            </Label>
            <Input
              id="apiUsername"
              value={settings.apiUsername}
              onChange={(e) => updateField("apiUsername", e.target.value)}
              placeholder="Вашето Econt потребителско име"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_API_USERNAME
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="apiPassword" className="font-medium">
              API Парола
            </Label>
            <Input
              id="apiPassword"
              type="password"
              value={settings.apiPassword}
              onChange={(e) => updateField("apiPassword", e.target.value)}
              placeholder="Вашата Econt парола"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_API_PASSWORD
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="apiBaseUrl" className="font-medium">
              API Base URL
            </Label>
            <Input
              id="apiBaseUrl"
              value={settings.apiBaseUrl}
              onChange={(e) => updateField("apiBaseUrl", e.target.value)}
              placeholder="https://ee.econt.com/services"
            />
            <Text className="text-ui-fg-muted text-xs">
              Демо: https://demo.econt.com/ee/services | Продукция:
              https://ee.econt.com/services
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-medium">Демо режим</Label>
            <Select
              value={settings.isDemo ? "true" : "false"}
              onValueChange={(v) => updateField("isDemo", v === "true")}
            >
              <Select.Trigger>
                <Select.Value placeholder="Изберете режим" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="true">
                  Да - Демо (тестова среда)
                </Select.Item>
                <Select.Item value="false">
                  Не - Продукция (реални пратки)
                </Select.Item>
              </Select.Content>
            </Select>
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_IS_DEMO
            </Text>
          </div>
        </div>
      </Container>

      {/* Sender Information */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Данни за подател
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Адресът на подателя се използва за изчисляване на цената за
          доставка и за етикети на пратките.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="senderClientNumber" className="font-medium">
              Клиентски номер
            </Label>
            <Input
              id="senderClientNumber"
              value={settings.senderClientNumber}
              onChange={(e) =>
                updateField("senderClientNumber", e.target.value)
              }
              placeholder="Вашият Econt клиентски номер"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_SENDER_CLIENT_NUMBER
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senderOfficeCode" className="font-medium">
              Код на офис за изпращане
            </Label>
            <Input
              id="senderOfficeCode"
              value={settings.senderOfficeCode}
              onChange={(e) =>
                updateField("senderOfficeCode", e.target.value)
              }
              placeholder="Напр. 1127 (незадължително)"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_SENDER_OFFICE_CODE. Ако е зададено, се използва
              вместо адрес на подател.
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senderCity" className="font-medium">
              Град на подател
            </Label>
            <Input
              id="senderCity"
              value={settings.senderCity}
              onChange={(e) => updateField("senderCity", e.target.value)}
              placeholder="Напр. София"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_SENDER_CITY. Използва се ако няма зададен код на
              офис.
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senderPostCode" className="font-medium">
              Пощенски код на подател
            </Label>
            <Input
              id="senderPostCode"
              value={settings.senderPostCode}
              onChange={(e) =>
                updateField("senderPostCode", e.target.value)
              }
              placeholder="Напр. 1000"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_SENDER_POST_CODE
            </Text>
          </div>
        </div>
      </Container>

      {/* COD Payout Configuration */}
      <Container className="p-8">
        <Heading level="h2" className="text-lg mb-2">
          Наложен платеж (COD) - Изплащане
        </Heading>
        <Text className="text-ui-fg-subtle mb-6">
          Конфигурация за получаване на събраните суми от наложен платеж.
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cdAgreementNum" className="font-medium">
              Номер на споразумение за НП
            </Label>
            <Input
              id="cdAgreementNum"
              value={settings.cdAgreementNum}
              onChange={(e) =>
                updateField("cdAgreementNum", e.target.value)
              }
              placeholder="Номер на споразумение с Econt"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_CD_AGREEMENT_NUM. Препоръчва се - опростява
              изплащането.
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-medium">Метод на изплащане</Label>
            <Select
              value={settings.payoutMethod}
              onValueChange={(v) =>
                updateField(
                  "payoutMethod",
                  v as "bank" | "office" | "door"
                )
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Изберете метод" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="bank">
                  По банков път
                </Select.Item>
                <Select.Item value="office">
                  В офис на Econt
                </Select.Item>
                <Select.Item value="door">
                  На врата (куриер)
                </Select.Item>
              </Select.Content>
            </Select>
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_PAYOUT_METHOD
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payoutIban" className="font-medium">
              IBAN за изплащане
            </Label>
            <Input
              id="payoutIban"
              value={settings.payoutIban}
              onChange={(e) => updateField("payoutIban", e.target.value)}
              placeholder="BG00XXXX00000000000000"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_PAYOUT_IBAN. Необходим при метод &quot;По банков
              път&quot;.
            </Text>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payoutBic" className="font-medium">
              BIC код
            </Label>
            <Input
              id="payoutBic"
              value={settings.payoutBic}
              onChange={(e) => updateField("payoutBic", e.target.value)}
              placeholder="Напр. UNCRBGSF"
            />
            <Text className="text-ui-fg-muted text-xs">
              Env: ECONT_PAYOUT_BIC. Необходим при метод &quot;По банков
              път&quot;.
            </Text>
          </div>
        </div>
      </Container>

      {/* Info Box */}
      <Container className="p-8">
        <div className="bg-ui-bg-subtle rounded-lg p-6">
          <Heading level="h3" className="text-base mb-3">
            Информация
          </Heading>
          <div className="space-y-2 text-sm text-ui-fg-subtle">
            <Text>
              Настройките се запазват в конфигурационен файл на сървъра.
              Промените на API данните за вход (потребителско име, парола)
              изискват рестартиране на сървъра.
            </Text>
            <Text>
              Стойности от .env файла се използват като начални стойности.
              Запазените настройки имат приоритет над .env стойностите.
            </Text>
            <Text>
              За продукционна среда задължително сменете демо режима на
              &quot;Не&quot; и въведете валидни данни за автентикация.
            </Text>
          </div>
        </div>
      </Container>

      {/* Bottom Save Button */}
      <Container className="p-8">
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            isLoading={isTesting}
          >
            Тест на връзката
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Запази настройките
          </Button>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Econt Настройки",
  icon: CogSixTooth,
})

export default EcontSettingsPage
