export interface GoogleSheetLeadInput {
  fullName: string;
  phone: string;
  email?: string | null;
  demandType?: string;
  source?: string;
  note?: string | null;
  pageUrl?: string | null;
}

/**
 * Tự động đồng bộ thông tin khách hàng tiềm năng lên Google Trang Tính (Google Sheets)
 * Spreadsheet ID: 18SLUQxjIkj6IHnDKYyZq_LU8iEcpGQsLHoMKk8Pee6U
 */
export async function pushLeadToGoogleSheet(input: GoogleSheetLeadInput) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    // Trường hợp chưa cài Webhook, chỉ log thông báo (đảm bảo không gây ảnh hưởng luồng ứng dụng chính)
    return;
  }

  try {
    const payload = {
      spreadsheetId: "18SLUQxjIkj6IHnDKYyZq_LU8iEcpGQsLHoMKk8Pee6U",
      timestamp: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || "",
      demandType: input.demandType || "TƯ VẤN",
      source: input.source || "WEBSITE",
      note: input.note || "",
      pageUrl: input.pageUrl || "",
    };

    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    }).catch((e) => console.error("Lỗi async push Google Sheets:", e));
  } catch (err) {
    console.error("Lỗi gửi dữ liệu sang Google Sheets:", err);
  }
}
