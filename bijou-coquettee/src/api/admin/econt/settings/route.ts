import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

/**
 * Econt settings are read from environment variables at startup.
 * This endpoint exposes the current (non-secret) values for the admin UI
 * and allows saving overrides to a local JSON config file.
 *
 * Sensitive values (password) are masked in the GET response.
 */

const SETTINGS_FILE = path.resolve(
  process.cwd(),
  "econt-settings.json",
);

type EcontSettings = {
  // API Authentication
  apiUsername: string;
  apiPassword: string;
  apiBaseUrl: string;
  isDemo: boolean;
  // Sender Information
  senderClientNumber: string;
  senderCity: string;
  senderPostCode: string;
  senderOfficeCode: string;
  // COD Payout
  cdAgreementNum: string;
  payoutMethod: "bank" | "office" | "door";
  payoutIban: string;
  payoutBic: string;
};

function readSettingsFile(): Partial<EcontSettings> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw) as Partial<EcontSettings>;
    }
  } catch {
    // Ignore file read errors
  }
  return {};
}

function writeSettingsFile(settings: Partial<EcontSettings>): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

/** Merge saved file settings with env vars (file overrides env) */
function getEffectiveSettings(): EcontSettings {
  const fileSettings = readSettingsFile();

  return {
    apiUsername:
      fileSettings.apiUsername || process.env.ECONT_API_USERNAME || "",
    apiPassword:
      fileSettings.apiPassword || process.env.ECONT_API_PASSWORD || "",
    apiBaseUrl:
      fileSettings.apiBaseUrl ||
      process.env.ECONT_API_BASE_URL ||
      "https://demo.econt.com/ee/services",
    isDemo:
      fileSettings.isDemo ?? process.env.ECONT_IS_DEMO === "true",
    senderClientNumber:
      fileSettings.senderClientNumber ||
      process.env.ECONT_SENDER_CLIENT_NUMBER ||
      "",
    senderCity:
      fileSettings.senderCity || process.env.ECONT_SENDER_CITY || "",
    senderPostCode:
      fileSettings.senderPostCode ||
      process.env.ECONT_SENDER_POST_CODE ||
      "",
    senderOfficeCode:
      fileSettings.senderOfficeCode ||
      process.env.ECONT_SENDER_OFFICE_CODE ||
      "",
    cdAgreementNum:
      fileSettings.cdAgreementNum ||
      process.env.ECONT_CD_AGREEMENT_NUM ||
      "",
    payoutMethod:
      fileSettings.payoutMethod ||
      (process.env.ECONT_PAYOUT_METHOD as "bank" | "office" | "door") ||
      "bank",
    payoutIban:
      fileSettings.payoutIban || process.env.ECONT_PAYOUT_IBAN || "",
    payoutBic:
      fileSettings.payoutBic || process.env.ECONT_PAYOUT_BIC || "",
  };
}

/** GET /admin/econt/settings - Return current settings (password masked) */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const settings = getEffectiveSettings();

  // Mask sensitive values
  const masked = {
    ...settings,
    apiPassword: settings.apiPassword
      ? "*".repeat(Math.min(settings.apiPassword.length, 12))
      : "",
  };

  res.json({ settings: masked });
}

/** POST /admin/econt/settings - Save settings overrides */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Partial<EcontSettings>;

  if (!body || typeof body !== "object") {
    res.status(400).json({ message: "Invalid settings payload." });
    return;
  }

  try {
    // Read existing file settings
    const existing = readSettingsFile();

    // Merge new values (only update fields that were actually sent)
    const updated: Partial<EcontSettings> = { ...existing };

    if (body.apiUsername !== undefined) updated.apiUsername = body.apiUsername;
    // Only update password if it's not the masked version
    if (body.apiPassword !== undefined && !body.apiPassword.match(/^\*+$/)) {
      updated.apiPassword = body.apiPassword;
    }
    if (body.apiBaseUrl !== undefined) updated.apiBaseUrl = body.apiBaseUrl;
    if (body.isDemo !== undefined) updated.isDemo = body.isDemo;
    if (body.senderClientNumber !== undefined)
      updated.senderClientNumber = body.senderClientNumber;
    if (body.senderCity !== undefined) updated.senderCity = body.senderCity;
    if (body.senderPostCode !== undefined)
      updated.senderPostCode = body.senderPostCode;
    if (body.senderOfficeCode !== undefined)
      updated.senderOfficeCode = body.senderOfficeCode;
    if (body.cdAgreementNum !== undefined)
      updated.cdAgreementNum = body.cdAgreementNum;
    if (body.payoutMethod !== undefined)
      updated.payoutMethod = body.payoutMethod;
    if (body.payoutIban !== undefined) updated.payoutIban = body.payoutIban;
    if (body.payoutBic !== undefined) updated.payoutBic = body.payoutBic;

    writeSettingsFile(updated);

    // Return the updated settings (masked)
    const effective = getEffectiveSettings();
    const masked = {
      ...effective,
      apiPassword: effective.apiPassword
        ? "*".repeat(Math.min(effective.apiPassword.length, 12))
        : "",
    };

    res.json({
      settings: masked,
      message: "Settings saved successfully. Restart the server for credential changes to take effect.",
    });
  } catch (error) {
    console.error("[Admin Econt Settings] Error saving:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to save settings.",
    });
  }
}
