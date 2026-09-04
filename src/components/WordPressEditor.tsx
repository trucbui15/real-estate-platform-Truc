"use client";

import { useEffect, useRef, useState } from "react";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

interface WordPressEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function WordPressEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết tại đây...",
}: WordPressEditorProps) {
  const [activeTab, setActiveTab] = useState<"VISUAL" | "TEXT">("VISUAL");
  const [showToolbarRow2, setShowToolbarRow2] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  // Modals for Link and Table insertion
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editorRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Sync incoming value to contentEditable when tab switches to VISUAL or initially
  useEffect(() => {
    if (editorRef.current && activeTab === "VISUAL") {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [activeTab]);

  function handleEditorInput() {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }

  function execCmd(command: string, valueArg: string | undefined = undefined) {
    if (activeTab !== "VISUAL") return;
    document.execCommand(command, false, valueArg);
    handleEditorInput();
  }

  function formatHeader(tag: string) {
    execCmd("formatBlock", tag);
  }

  async function handleMediaUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          const optimizedSrc = getOptimizedCloudinaryUrl(data.url, "GALLERY");
          const imgHtml = `<p><img src="${optimizedSrc}" alt="${file.name}" class="my-4 rounded-xl max-w-full h-auto shadow-sm mx-auto block" /></p><p><br/></p>`;
          execCmd("insertHTML", imgHtml);
        }
      }
    } catch (err) {
      alert("Tải hình ảnh thất bại");
    } finally {
      setUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  }

  function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const targetAttr = linkNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    const label = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" ${targetAttr} class="text-blue-600 underline font-semibold hover:text-blue-800">${label}</a>`;
    execCmd("insertHTML", linkHtml);
    setLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
  }

  function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    let tableHtml = `<table class="w-full border-collapse border border-slate-300 my-4 text-sm"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="border border-slate-300 p-2.5 min-w-[80px]">${r === 0 ? `<b>Cột ${c + 1}</b>` : `Ô ${r + 1}-${c + 1}`}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;
    execCmd("insertHTML", tableHtml);
    setTableModalOpen(false);
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-xs space-y-0">
      {/* WORDPRESS HEADER & MEDIA BUTTON & TABS */}
      <div className="bg-slate-100 border-b border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* ADD MEDIA BUTTON */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <span>📷</span>
            <span>{uploading ? "Đang tải ảnh..." : "Thêm Media"}</span>
          </button>
          <input
            type="file"
            ref={mediaInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleMediaUpload(e.target.files)}
          />
        </div>

        {/* VISUAL / TEXT TABS (WORDPRESS CLASSIC TABS) */}
        <div className="flex items-center rounded-lg bg-slate-200/80 p-0.5 text-xs font-bold border border-slate-300/60">
          <button
            type="button"
            onClick={() => setActiveTab("VISUAL")}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              activeTab === "VISUAL"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Trực quan (Visual)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TEXT")}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              activeTab === "TEXT"
                ? "bg-white text-blue-700 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Văn bản (HTML)
          </button>
        </div>
      </div>

      {/* WORDPRESS TOOLBAR (ONLY FOR VISUAL MODE) */}
      {activeTab === "VISUAL" && (
        <div className="bg-slate-50 border-b border-slate-200 p-2 space-y-1.5 text-xs select-none">
          {/* TOOLBAR ROW 1 */}
          <div className="flex flex-wrap items-center gap-1">
            {/* PARAGRAPH / HEADINGS DROPDOWN */}
            <select
              onChange={(e) => formatHeader(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="p">Đoạn văn (Paragraph)</option>
              <option value="h2">Tiêu đề 2 (H2)</option>
              <option value="h3">Tiêu đề 3 (H3)</option>
              <option value="h4">Tiêu đề 4 (H4)</option>
              <option value="blockquote">Trích dẫn (Quote)</option>
              <option value="pre">Định dạng mã (Pre)</option>
            </select>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            {/* BOLD, ITALIC, UNDERLINE, STRIKE */}
            <button
              type="button"
              onClick={() => execCmd("bold")}
              className="h-7 w-7 bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-900 flex items-center justify-center cursor-pointer"
              title="In đậm (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCmd("italic")}
              className="h-7 w-7 bg-white hover:bg-slate-200 border border-slate-300 rounded italic font-semibold text-slate-900 flex items-center justify-center cursor-pointer"
              title="In nghiêng (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCmd("underline")}
              className="h-7 w-7 bg-white hover:bg-slate-200 border border-slate-300 rounded underline font-semibold text-slate-900 flex items-center justify-center cursor-pointer"
              title="Gạch chân (Ctrl+U)"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => execCmd("strikeThrough")}
              className="h-7 w-7 bg-white hover:bg-slate-200 border border-slate-300 rounded line-through text-slate-700 flex items-center justify-center cursor-pointer"
              title="Gạch giữa"
            >
              S
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            {/* LISTS */}
            <button
              type="button"
              onClick={() => execCmd("insertUnorderedList")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 flex items-center justify-center cursor-pointer"
              title="Danh sách dấu chấm"
            >
              • Danh sách
            </button>
            <button
              type="button"
              onClick={() => execCmd("insertOrderedList")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 flex items-center justify-center cursor-pointer"
              title="Danh sách số"
            >
              1. Danh sách
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            {/* ALIGNMENT */}
            <button
              type="button"
              onClick={() => execCmd("justifyLeft")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
              title="Căn trái"
            >
              ⬅ Trái
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyCenter")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
              title="Căn giữa"
            >
              ↔ Giữa
            </button>
            <button
              type="button"
              onClick={() => execCmd("justifyRight")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-700 font-mono text-[11px] cursor-pointer"
              title="Căn phải"
            >
              ➡ Phải
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            {/* LINK & UNLINK */}
            <button
              type="button"
              onClick={() => setLinkModalOpen(true)}
              className="h-7 px-2 bg-white hover:bg-blue-50 border border-slate-300 rounded font-bold text-blue-700 flex items-center gap-1 cursor-pointer"
              title="Chèn liên kết"
            >
              🔗 Chèn Link
            </button>
            <button
              type="button"
              onClick={() => execCmd("unlink")}
              className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-600 cursor-pointer"
              title="Xóa liên kết"
            >
              ✂️ Bỏ Link
            </button>

            <div className="h-4 w-[1px] bg-slate-300 mx-1" />

            {/* TOGGLE ROW 2 */}
            <button
              type="button"
              onClick={() => setShowToolbarRow2(!showToolbarRow2)}
              className={`h-7 px-2 border rounded font-semibold transition cursor-pointer ${
                showToolbarRow2
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
              title="Thanh công cụ nâng cao"
            >
              ⚙️ Nâng cao
            </button>
          </div>

          {/* TOOLBAR ROW 2 (EXPANDABLE WORDPRESS TOOLBAR) */}
          {showToolbarRow2 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200">
              {/* TEXT COLOR */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded">
                <span className="text-[11px] font-bold text-slate-600">Màu chữ:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    execCmd("foreColor", e.target.value);
                  }}
                  className="h-5 w-6 cursor-pointer border-none bg-transparent"
                />
              </div>

              {/* HIGHLIGHT COLOR */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded">
                <span className="text-[11px] font-bold text-slate-600">Nền chữ:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    execCmd("hiliteColor", e.target.value);
                  }}
                  className="h-5 w-6 cursor-pointer border-none bg-transparent"
                />
              </div>

              {/* INSERT TABLE */}
              <button
                type="button"
                onClick={() => setTableModalOpen(true)}
                className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer"
              >
                📊 Chèn Bảng
              </button>

              {/* HORIZONTAL LINE */}
              <button
                type="button"
                onClick={() => execCmd("insertHorizontalRule")}
                className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer"
              >
                ― Thêm kẻ ngang
              </button>

              {/* CLEAR FORMATTING */}
              <button
                type="button"
                onClick={() => execCmd("removeFormat")}
                className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer"
                title="Xóa định dạng"
              >
                Xóa định dạng
              </button>

              {/* UNDO / REDO */}
              <button
                type="button"
                onClick={() => execCmd("undo")}
                className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                title="Hoàn tác (Ctrl+Z)"
              >
                ↩️ Hoàn tác
              </button>
              <button
                type="button"
                onClick={() => execCmd("redo")}
                className="h-7 px-2 bg-white hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                title="Làm lại (Ctrl+Y)"
              >
                ↪️ Làm lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDITOR CONTENT AREA */}
      <div>
        {activeTab === "VISUAL" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="w-full min-h-[380px] p-5 focus:outline-none font-sans text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none border-0"
            style={{ minHeight: "380px" }}
          />
        ) : (
          <textarea
            rows={18}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[380px] p-4 font-mono text-xs text-slate-900 bg-slate-900/95 text-slate-100 focus:outline-none leading-relaxed"
            placeholder="Nhập mã mã HTML trực tiếp..."
          />
        )}
      </div>

      {/* FOOTER BAR (WORDPRESS WORD COUNTER) */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>Trạng thái: Trực quan WYSIWYG</div>
        <div>
          Số từ: {value.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length} từ
        </div>
      </div>

      {/* MODAL: INSERT LINK */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddLink} className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">🔗 Chèn đường dẫn liên kết</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ URL link</label>
              <input
                type="url"
                required
                placeholder="https://minhdungland.com.vn/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Văn bản hiển thị (Tùy chọn)</label>
              <input
                type="text"
                placeholder="Ví dụ: Bấm xem dự án tại đây"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={linkNewTab}
                onChange={(e) => setLinkNewTab(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              Mở link trong tab mới (_blank)
            </label>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Chèn Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: INSERT TABLE */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddTable} className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">📊 Chèn bảng dữ liệu</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số hàng (Rows)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số cột (Cols)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Tạo Bảng
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
