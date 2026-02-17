import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import * as fs from "fs"
import * as path from "path"
import type { InvoiceLineItem } from "../types"
import { EUR_TO_BGN_RATE, eurToBgn } from "../constants"

// A4 dimensions in points (595.28 x 841.89)
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

type InvoiceData = {
  invoice_number: string
  invoice_date: string
  // Seller
  seller_company_name: string
  seller_eik: string
  seller_vat_number: string | null
  seller_mol: string
  seller_address: string
  seller_city: string
  seller_postal_code: string
  seller_country: string
  seller_bank_name: string | null
  seller_iban: string | null
  seller_bic: string | null
  // Buyer
  buyer_name: string
  buyer_company_name: string | null
  buyer_eik: string | null
  buyer_vat_number: string | null
  buyer_address: string
  buyer_city: string
  buyer_postal_code: string
  buyer_country: string
  // Items & totals
  line_items: InvoiceLineItem[]
  subtotal: number
  vat_breakdown: Record<string, number>
  total_vat: number
  total: number
  currency_code: string
  payment_method: string | null
  // Other
  notes: string | null
  prepared_by: string | null
  received_by: string | null
  footer_note: string | null
}

function formatEur(amount: number): string {
  return `${amount.toFixed(2)} EUR`
}

function formatBgn(amount: number): string {
  return `${amount.toFixed(2)} лв.`
}

/** Format amount in EUR with BGN equivalent in parentheses */
function formatDual(eurAmount: number): string {
  const bgnAmount = eurToBgn(eurAmount)
  return `${formatEur(eurAmount)} (${formatBgn(bgnAmount)})`
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

async function loadFonts(doc: PDFDocument) {
  doc.registerFontkit(fontkit)

  const fontsDir = path.resolve(process.cwd(), "static", "fonts")

  const regularPath = path.join(fontsDir, "Inter-Regular.ttf")
  const mediumPath = path.join(fontsDir, "Inter-Medium.ttf")

  const regularBytes = fs.readFileSync(regularPath)
  const mediumBytes = fs.readFileSync(mediumPath)

  const regular = await doc.embedFont(regularBytes)
  const medium = await doc.embedFont(mediumBytes)

  return { regular, medium }
}

function drawLine(
  page: PDFPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness = 0.5
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color: rgb(0.7, 0.7, 0.7),
  })
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0.1, 0.1, 0.1)
) {
  page.drawText(text, { x, y, font, size, color })
}

function drawTextRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color = rgb(0.1, 0.1, 0.1)
) {
  const width = font.widthOfTextAtSize(text, size)
  drawText(page, text, rightX - width, y, font, size, color)
}

export async function generateInvoicePdf(
  data: InvoiceData
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const { regular, medium } = await loadFonts(doc)

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  // ── Title ──
  const title = "ФАКТУРА / INVOICE"
  const titleWidth = medium.widthOfTextAtSize(title, 18)
  drawText(
    page,
    title,
    (PAGE_WIDTH - titleWidth) / 2,
    y,
    medium,
    18,
    rgb(0.15, 0.15, 0.15)
  )
  y -= 10

  // ── Оригинал ──
  const orig = "Оригинал"
  const origWidth = regular.widthOfTextAtSize(orig, 8)
  drawText(
    page,
    orig,
    (PAGE_WIDTH - origWidth) / 2,
    y,
    regular,
    8,
    rgb(0.5, 0.5, 0.5)
  )
  y -= 20

  // ── Invoice Number & Date ──
  drawText(
    page,
    `Номер: ${data.invoice_number}`,
    MARGIN,
    y,
    medium,
    10
  )
  drawTextRight(
    page,
    `Дата: ${formatDate(data.invoice_date)}`,
    PAGE_WIDTH - MARGIN,
    y,
    medium,
    10
  )
  y -= 20

  drawLine(page, MARGIN, y, PAGE_WIDTH - MARGIN, y, 1)
  y -= 20

  // ── Seller & Buyer Boxes ──
  const boxWidth = (CONTENT_WIDTH - 20) / 2
  const sellerX = MARGIN
  const buyerX = MARGIN + boxWidth + 20

  // Seller Header
  drawText(page, "ДОСТАВЧИК / ПРОДАВАЧ", sellerX, y, medium, 9, rgb(0.3, 0.3, 0.3))
  drawText(page, "ПОЛУЧАТЕЛ / КУПУВАЧ", buyerX, y, medium, 9, rgb(0.3, 0.3, 0.3))
  y -= 16

  // Seller Details
  const sellerLines = [
    data.seller_company_name,
    `ЕИК: ${data.seller_eik}`,
    ...(data.seller_vat_number ? [`ДДС No: ${data.seller_vat_number}`] : []),
    `МОЛ: ${data.seller_mol}`,
    `${data.seller_address}`,
    `${data.seller_postal_code} ${data.seller_city}, ${data.seller_country}`,
  ]

  // Buyer Details
  const buyerName = data.buyer_company_name || data.buyer_name
  const buyerLines = [
    buyerName,
    ...(data.buyer_eik ? [`ЕИК: ${data.buyer_eik}`] : []),
    ...(data.buyer_vat_number ? [`ДДС No: ${data.buyer_vat_number}`] : []),
    ...(data.buyer_name !== buyerName ? [data.buyer_name] : []),
    data.buyer_address,
    `${data.buyer_postal_code} ${data.buyer_city}, ${data.buyer_country}`,
  ]

  const maxLines = Math.max(sellerLines.length, buyerLines.length)
  for (let i = 0; i < maxLines; i++) {
    const fontSize = i === 0 ? 10 : 9
    const font = i === 0 ? medium : regular

    if (i < sellerLines.length) {
      drawText(page, sellerLines[i], sellerX, y, font, fontSize)
    }
    if (i < buyerLines.length) {
      drawText(page, buyerLines[i], buyerX, y, font, fontSize)
    }
    y -= 14
  }

  // Bank details under seller
  if (data.seller_iban) {
    y -= 4
    drawText(page, `Банка: ${data.seller_bank_name || ""}`, sellerX, y, regular, 8, rgb(0.4, 0.4, 0.4))
    y -= 12
    drawText(page, `IBAN: ${data.seller_iban}`, sellerX, y, regular, 8, rgb(0.4, 0.4, 0.4))
    if (data.seller_bic) {
      drawText(page, `BIC: ${data.seller_bic}`, sellerX + 200, y, regular, 8, rgb(0.4, 0.4, 0.4))
    }
    y -= 12
  }

  y -= 6

  // ── Exchange rate note ──
  const rateNote = `Валутен курс / Exchange rate: 1 EUR = ${EUR_TO_BGN_RATE} BGN (фиксиран)`
  const rateNoteWidth = regular.widthOfTextAtSize(rateNote, 7.5)
  drawText(
    page,
    rateNote,
    (PAGE_WIDTH - rateNoteWidth) / 2,
    y,
    regular,
    7.5,
    rgb(0.4, 0.4, 0.4)
  )
  y -= 14

  drawLine(page, MARGIN, y, PAGE_WIDTH - MARGIN, y, 1)
  y -= 20

  // ── Items Table Header ──
  const colNo = MARGIN
  const colDesc = MARGIN + 30
  const colQty = MARGIN + CONTENT_WIDTH - 250
  const colPrice = MARGIN + CONTENT_WIDTH - 200
  const colVat = MARGIN + CONTENT_WIDTH - 120
  const colTotal = PAGE_WIDTH - MARGIN

  drawText(page, "No", colNo, y, medium, 8, rgb(0.4, 0.4, 0.4))
  drawText(page, "Описание", colDesc, y, medium, 8, rgb(0.4, 0.4, 0.4))
  drawText(page, "Кол.", colQty, y, medium, 8, rgb(0.4, 0.4, 0.4))
  drawText(page, "Ед. цена (EUR)", colPrice, y, medium, 8, rgb(0.4, 0.4, 0.4))
  drawText(page, "ДДС%", colVat, y, medium, 8, rgb(0.4, 0.4, 0.4))
  drawTextRight(page, "Стойност (EUR)", colTotal, y, medium, 8, rgb(0.4, 0.4, 0.4))
  y -= 8
  drawLine(page, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.5)
  y -= 14

  // ── Items ──
  for (let i = 0; i < data.line_items.length; i++) {
    const item = data.line_items[i]

    // Check if we need a new page
    if (y < MARGIN + 120) {
      const newPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = PAGE_HEIGHT - MARGIN
      // Re-draw header on new page
      drawText(newPage, "No", colNo, y, medium, 8, rgb(0.4, 0.4, 0.4))
      drawText(newPage, "Описание", colDesc, y, medium, 8, rgb(0.4, 0.4, 0.4))
      drawText(newPage, "Кол.", colQty, y, medium, 8, rgb(0.4, 0.4, 0.4))
      drawText(newPage, "Ед. цена (EUR)", colPrice, y, medium, 8, rgb(0.4, 0.4, 0.4))
      drawText(newPage, "ДДС%", colVat, y, medium, 8, rgb(0.4, 0.4, 0.4))
      drawTextRight(newPage, "Стойност (EUR)", colTotal, y, medium, 8, rgb(0.4, 0.4, 0.4))
      y -= 8
      drawLine(newPage, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.5)
      y -= 14
    }

    const currentPage = doc.getPages()[doc.getPageCount() - 1]

    // Truncate long descriptions
    let desc = item.description
    const maxDescWidth = colQty - colDesc - 10
    while (regular.widthOfTextAtSize(desc, 9) > maxDescWidth && desc.length > 3) {
      desc = desc.slice(0, -4) + "..."
    }

    drawText(currentPage, String(i + 1), colNo, y, regular, 9)
    drawText(currentPage, desc, colDesc, y, regular, 9)
    drawText(currentPage, String(item.quantity), colQty, y, regular, 9)
    drawText(
      currentPage,
      formatEur(item.unit_price),
      colPrice,
      y,
      regular,
      9
    )
    drawText(currentPage, `${item.vat_rate}%`, colVat, y, regular, 9)
    drawTextRight(
      currentPage,
      formatEur(item.line_total),
      colTotal,
      y,
      regular,
      9
    )

    y -= 4
    drawLine(currentPage, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.3)
    y -= 14
  }

  const lastPage = doc.getPages()[doc.getPageCount() - 1]
  y -= 6

  // ── Subtotal ──
  drawLine(lastPage, MARGIN, y, PAGE_WIDTH - MARGIN, y, 1)
  y -= 18

  const summaryLabelX = MARGIN + CONTENT_WIDTH - 250
  const summaryValueX = PAGE_WIDTH - MARGIN

  // Subtotal in EUR
  drawText(lastPage, "Данъчна основа:", summaryLabelX, y, regular, 9)
  drawTextRight(
    lastPage,
    formatDual(data.subtotal),
    summaryValueX,
    y,
    medium,
    9
  )
  y -= 16

  // ── VAT Breakdown ──
  const vatRates = Object.entries(data.vat_breakdown).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  )
  for (const [rate, amount] of vatRates) {
    if (Number(amount) === 0 && Number(rate) === 0) continue
    drawText(
      lastPage,
      `ДДС ${rate}%:`,
      summaryLabelX,
      y,
      regular,
      9
    )
    drawTextRight(
      lastPage,
      formatDual(Number(amount)),
      summaryValueX,
      y,
      regular,
      9
    )
    y -= 16
  }

  // ── Total ──
  drawLine(lastPage, summaryLabelX, y + 4, PAGE_WIDTH - MARGIN, y + 4, 1)
  y -= 6
  drawText(lastPage, "ОБЩА СУМА ЗА ПЛАЩАНЕ:", summaryLabelX, y, medium, 10)
  y -= 18

  // Total in EUR (large)
  drawTextRight(
    lastPage,
    formatEur(data.total),
    summaryValueX,
    y,
    medium,
    14
  )
  y -= 16

  // Total in BGN (secondary, slightly smaller)
  const bgnTotal = eurToBgn(data.total)
  drawTextRight(
    lastPage,
    `(${formatBgn(bgnTotal)})`,
    summaryValueX,
    y,
    regular,
    10,
    rgb(0.35, 0.35, 0.35)
  )
  y -= 22

  // ── Payment method ──
  if (data.payment_method) {
    drawText(
      lastPage,
      `Начин на плащане: ${data.payment_method}`,
      MARGIN,
      y,
      regular,
      9,
      rgb(0.4, 0.4, 0.4)
    )
    y -= 20
  }

  // ── Notes ──
  if (data.notes) {
    drawText(
      lastPage,
      `Забележки: ${data.notes}`,
      MARGIN,
      y,
      regular,
      8,
      rgb(0.4, 0.4, 0.4)
    )
    y -= 20
  }

  // ── Footer note ──
  if (data.footer_note) {
    drawText(
      lastPage,
      data.footer_note,
      MARGIN,
      y,
      regular,
      8,
      rgb(0.5, 0.5, 0.5)
    )
    y -= 20
  }

  // ── Signatures ──
  y = Math.min(y, MARGIN + 60)
  drawLine(lastPage, MARGIN, y, PAGE_WIDTH - MARGIN, y, 0.5)
  y -= 20

  const sigLeft = MARGIN
  const sigRight = MARGIN + CONTENT_WIDTH / 2 + 20

  drawText(lastPage, "Съставил:", sigLeft, y, medium, 9, rgb(0.3, 0.3, 0.3))
  drawText(lastPage, "Получил:", sigRight, y, medium, 9, rgb(0.3, 0.3, 0.3))
  y -= 14

  drawText(
    lastPage,
    data.prepared_by || "___________________",
    sigLeft,
    y,
    regular,
    9
  )
  drawText(
    lastPage,
    data.received_by || "___________________",
    sigRight,
    y,
    regular,
    9
  )

  return doc.save()
}
