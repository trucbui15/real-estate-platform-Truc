export interface GoogleSheetLeadInput {
  fullName: string;
  phone: string;
  email?: string | null;
  demandType?: string;
  source?: string;
  note?: string | null;
  pageUrl?: string | null;
  collaboratorName?: string | null;
  collaboratorToken?: string | null;
}

/**
 * Tự động đồng bộ thông tin khách hàng tiềm năng lên Google Trang Tính (Google Sheets)
 * Spreadsheet ID: 18SLUQxjIkj6IHnDKYyZq_LU8iEcpGQsLHoMKk8Pee6U
 */
export async function pushLeadToGoogleSheet(input: GoogleSheetLeadInput): Promise<boolean> {
  const webhookUrl =
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    "https://script.google.com/macros/s/AKfycbwpy0SQsqCnS_bbTRf7Lh6qu8AONnGIMDzB0xa1BvCoOecPFbTs4bi0boIlgTyNBKLu/exec";

  try {
    const finalSource = input.collaboratorName
      ? `CTV (${input.collaboratorName})`
      : (input.source || "WEBSITE");

    const collabNote = input.collaboratorName
      ? ` [Người giới thiệu: ${input.collaboratorName}${input.collaboratorToken ? ` - Mã: ${input.collaboratorToken}` : ""}]`
      : "";
    const finalNote = `${input.note || ""}${collabNote}`.trim();

    const payload = {
      spreadsheetId: "18SLUQxjIkj6IHnDKYyZq_LU8iEcpGQsLHoMKk8Pee6U",
      timestamp: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || "",
      demandType: input.demandType || "TƯ VẤN",
      source: finalSource,
      note: finalNote,
      pageUrl: input.pageUrl || "",
    };

    // Thiết lập timeout 12 giây để đủ thời gian Google Apps Script khởi động và ghi vào Sheet
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`[GoogleSheets] Webhook phản hồi lỗi HTTP ${res.status}`);
      return false;
    }

    const resText = await res.text();
    console.log("[GoogleSheets] Đã đồng bộ Google Sheet thành công:", resText);
    return true;
  } catch (err: any) {
    if (err.name === "AbortError") {
      console.warn("[GoogleSheets] Timeout khi gửi dữ liệu sang Google Sheets (sau 5s).");
    } else {
      console.error("[GoogleSheets] Lỗi gửi dữ liệu sang Google Sheets:", err);
    }
    return false;
  }
}

