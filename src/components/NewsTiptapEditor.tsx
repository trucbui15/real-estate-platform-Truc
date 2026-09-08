"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useEffect, useRef, useState } from "react";
import { compressImage, revokePreviewUrl } from "@/lib/imageCompression";
import { slugify } from "@/lib/utils";

interface NewsTiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function NewsTiptapEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết tại đây...",
}: NewsTiptapEditorProps) {
  // Modals state
  const [internalLinkModalOpen, setInternalLinkModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [infoBoxModalOpen, setInfoBoxModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [listingModalOpen, setListingModalOpen] = useState(false);

  // Link Tool Form State
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [linkRel, setLinkRel] = useState<"" | "nofollow" | "sponsored">("");

  // Internal Link Search State
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalTypeFilter, setInternalTypeFilter] = useState<"ALL" | "PROJECT" | "LISTING" | "NEWS" | "PAGE">("ALL");
  const [internalResults, setInternalResults] = useState<any[]>([]);
  const [internalSearching, setInternalSearching] = useState(false);

  // Image Modal State
  const [imageTab, setImageTab] = useState<"UPLOAD" | "URL">("UPLOAD");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("center");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // CTA Modal State
  const [ctaText, setCtaText] = useState("Xem bảng hàng chi tiết");
  const [ctaUrl, setCtaUrl] = useState("/listings");
  const [ctaVariant, setCtaVariant] = useState<"sky" | "dark" | "emerald">("sky");

  // Info Box Modal State
  const [infoBoxTitle, setInfoBoxTitle] = useState("Lưu ý quan trọng");
  const [infoBoxContent, setInfoBoxContent] = useState("Giá và trạng thái căn có thể thay đổi tùy từng thời điểm giao dịch.");
  const [infoBoxVariant, setInfoBoxVariant] = useState<"info" | "warning" | "alert">("info");

  // Project / Listing Search State
  const [projectSearch, setProjectSearch] = useState("");
  const [projectResults, setProjectResults] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  const [listingSearch, setListingSearch] = useState("");
  const [listingResults, setListingResults] = useState<any[]>([]);
  const [listingLoading, setListingLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // CẤM H1: Chỉ cho phép H2 và H3 trong body
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-sky-600 underline font-semibold hover:text-sky-800",
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full h-auto shadow-md mx-auto block border border-slate-200",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[420px] p-5 sm:p-7 focus:outline-none text-slate-800 text-sm sm:text-base leading-relaxed bg-white rounded-b-2xl",
      },
      transformPastedHTML(html) {
        // PASTE CLEANUP: Clean inline dirty styles and font wrappers from Word / ChatGPT / Google Docs
        let clean = html;
        // Strip dangerous scripts
        clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
        clean = clean.replace(/on\w+="[^"]*"/gi, "");
        clean = clean.replace(/javascript:/gi, "");
        // Clean inline styles but preserve text-align
        clean = clean.replace(/style="([^"]*)"/gi, (match, styleContent) => {
          const alignMatch = styleContent.match(/text-align\s*:\s*(left|center|right|justify)/i);
          if (alignMatch) {
            return `style="text-align: ${alignMatch[1].toLowerCase()};"`;
          }
          return "";
        });
        clean = clean.replace(/class="mso[^"]*"/gi, "");
        // Convert accidental H1 to H2
        clean = clean.replace(/<h1(\b[^>]*)>/gi, "<h2$1>");
        clean = clean.replace(/<\/h1>/gi, "</h2>");
        return clean;
      },
    },
  });

  // Sync external value
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Check if content contains H1
  const hasH1 = value ? /<h1\b/i.test(value) : false;

  // Search Internal Links
  useEffect(() => {
    if (!internalLinkModalOpen) return;
    const timer = setTimeout(async () => {
      setInternalSearching(true);
      try {
        const res = await fetch(
          `/api/internal-links?q=${encodeURIComponent(internalSearchQuery)}&type=${internalTypeFilter}`
        );
        if (res.ok) {
          const data = await res.json();
          setInternalResults(data);
        }
      } catch (e) {
        console.error("Internal link search error:", e);
      } finally {
        setInternalSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [internalSearchQuery, internalTypeFilter, internalLinkModalOpen]);

  // Search Projects
  useEffect(() => {
    if (!projectModalOpen) return;
    const timer = setTimeout(async () => {
      setProjectLoading(true);
      try {
        const res = await fetch(`/api/internal-links?type=PROJECT&q=${encodeURIComponent(projectSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setProjectResults(data);
        }
      } catch (e) {
        console.error("Project search error:", e);
      } finally {
        setProjectLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [projectSearch, projectModalOpen]);

  // Search Listings
  useEffect(() => {
    if (!listingModalOpen) return;
    const timer = setTimeout(async () => {
      setListingLoading(true);
      try {
        const res = await fetch(`/api/internal-links?type=LISTING&q=${encodeURIComponent(listingSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setListingResults(data);
        }
      } catch (e) {
        console.error("Listing search error:", e);
      } finally {
        setListingLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [listingSearch, listingModalOpen]);

  if (!editor) {
    return (
      <div className="min-h-[420px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        ⏳ Đang khởi tạo trình soạn thảo Tiptap...
      </div>
    );
  }

  // --- ACTIONS ---

  function openLinkModal() {
    const { from, to } = editor!.state.selection;
    const selectedText = editor!.state.doc.textBetween(from, to, " ");
    const prevAttrs = editor!.getAttributes("link");

    setLinkText(selectedText || "");
    setLinkUrl(prevAttrs.href || "");
    setLinkNewTab(prevAttrs.target === "_blank");
    setLinkRel((prevAttrs.rel?.includes("sponsored") ? "sponsored" : prevAttrs.rel?.includes("nofollow") ? "nofollow" : "") as any);
    setLinkModalOpen(true);
  }

  function handleSaveLink() {
    if (!linkUrl.trim()) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkModalOpen(false);
      return;
    }

    const attrs: any = { href: linkUrl.trim() };
    if (linkNewTab) {
      attrs.target = "_blank";
    }
    if (linkRel) {
      attrs.rel = linkNewTab ? `noopener noreferrer ${linkRel}` : linkRel;
    } else if (linkNewTab) {
      attrs.rel = "noopener noreferrer";
    }

    if (linkText && editor?.state.selection.empty) {
      editor?.chain().focus().insertContent(`<a href="${linkUrl.trim()}">${linkText}</a>`).run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    setLinkModalOpen(false);
  }

  function handleInsertInternalLink(item: { title: string; url: string }) {
    const { from, to } = editor!.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      editor?.chain().focus().setLink({ href: item.url }).run();
    } else {
      editor?.chain().focus().insertContent(`<a href="${item.url}">${item.title}</a>`).run();
    }
    setInternalLinkModalOpen(false);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setUploadStatus("Đang nén tối ưu ảnh...");

    try {
      const optResult = await compressImage(files[0], "DEFAULT");
      setUploadStatus(`Đang tải lên Cloud (${optResult.formattedOriginalSize} → ${optResult.formattedOptimizedSize})...`);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rp8nsv0a";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "minhdungland";
      let finalUrl = "";

      // 1. Cloudinary
      try {
        const cloudFd = new FormData();
        cloudFd.append("file", optResult.file);
        cloudFd.append("upload_preset", uploadPreset);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudFd,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) finalUrl = cloudData.secure_url;
        }
      } catch (e) {
        console.warn("Direct upload error, falling back to /api/upload", e);
      }

      // 2. Fallback
      if (!finalUrl) {
        const fd = new FormData();
        fd.append("file", optResult.file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) finalUrl = data.url;
      }

      if (finalUrl) {
        setImageUrl(finalUrl);
      }
      revokePreviewUrl(optResult.previewUrl);
    } catch (e: any) {
      alert("Tải ảnh thất bại: " + (e.message || "Lỗi mạng"));
    } finally {
      setUploadingImage(false);
      setUploadStatus("");
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  }

  function handleInsertImage() {
    if (!imageUrl.trim()) {
      alert("Vui lòng tải ảnh lên hoặc nhập URL ảnh.");
      return;
    }

    const altSafe = imageAlt.trim() || "Hình ảnh bài viết";
    const captionSafe = imageCaption.trim();

    const figureHtml = `
      <figure data-type="article-image" class="article-figure" data-align="${imageAlign}">
        <img src="${imageUrl.trim()}" alt="${altSafe}" class="article-img" loading="lazy" />
        ${captionSafe ? `<figcaption class="article-figcaption">${captionSafe}</figcaption>` : ""}
      </figure>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(figureHtml).run();
    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  }

  function handleInsertCta() {
    const ctaHtml = `
      <div data-type="cta-block" data-text="${ctaText.trim()}" data-url="${ctaUrl.trim()}" data-variant="${ctaVariant}" class="article-cta-box">
        <div class="article-cta-text">${ctaText.trim()}</div>
        <a href="${ctaUrl.trim()}" class="article-cta-btn">${ctaText.trim()} &rarr;</a>
      </div>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(ctaHtml).run();
    setCtaModalOpen(false);
  }

  function handleInsertInfoBox() {
    const icon = infoBoxVariant === "info" ? "💡" : infoBoxVariant === "warning" ? "⚠️" : "🚨";
    const boxHtml = `
      <div data-type="info-box" data-variant="${infoBoxVariant}" data-title="${infoBoxTitle.trim()}" class="article-info-box ${infoBoxVariant}">
        <div class="article-info-title">${icon} ${infoBoxTitle.trim()}</div>
        <div class="article-info-content">${infoBoxContent.trim()}</div>
      </div>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(boxHtml).run();
    setInfoBoxModalOpen(false);
  }

  function handleInsertProjectCard(project: any) {
    const cardHtml = `
      <div data-type="project-card" data-project-slug="${project.extra?.slug || project.url.replace('/projects/', '')}" data-project-name="${project.title}" class="article-project-card">
        <a href="${project.url}" class="article-project-link">
          <div class="article-project-info">
            <span class="article-embed-badge bg-sky-100 text-sky-800">DỰ ÁN NỔI BẬT</span>
            <h4 class="font-bold text-slate-900">${project.title}</h4>
            <p class="text-xs text-slate-500">${project.subtitle || ""}</p>
            <span class="text-xs font-bold text-sky-600">Xem chi tiết dự án &rarr;</span>
          </div>
        </a>
      </div>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(cardHtml).run();
    setProjectModalOpen(false);
  }

  function handleInsertListingCard(listing: any) {
    const cardHtml = `
      <div data-type="listing-card" data-listing-slug="${listing.extra?.slug || listing.url.replace('/listings/', '')}" data-product-code="${listing.extra?.productCode || ''}" class="article-listing-card">
        <a href="${listing.url}" class="article-listing-link">
          <div class="article-listing-info">
            <span class="article-embed-badge bg-emerald-100 text-emerald-800">BẤT ĐỘNG SẢN</span>
            <h4 class="font-bold text-slate-900">${listing.title}</h4>
            <p class="text-xs font-semibold text-slate-600">${listing.subtitle || ""}</p>
            <span class="text-xs font-bold text-sky-600">Xem chi tiết BĐS &rarr;</span>
          </div>
        </a>
      </div>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(cardHtml).run();
    setListingModalOpen(false);
  }

  function handleInsertTableOfContents() {
    const rawHtml = editor?.getHTML() || "";
    const regex = /<(h[23])(?:[^>]*id=["']([^"']+)["'])?[^>]*>(.*?)<\/\1>/gi;
    const items: Array<{ id: string; text: string; level: number }> = [];
    let match;

    while ((match = regex.exec(rawHtml)) !== null) {
      const level = match[1].toLowerCase() === "h2" ? 2 : 3;
      const cleanText = match[3].replace(/<[^>]*>/g, "").trim();
      const id = match[2] || slugify(cleanText);
      if (cleanText) items.push({ id, text: cleanText, level });
    }

    if (items.length === 0) {
      alert("Chưa tìm thấy thẻ tiêu đề H2 hoặc H3 nào trong bài viết để tạo mục lục.");
      return;
    }

    const listItemsHtml = items
      .map(
        (i) =>
          `<li class="${i.level === 3 ? "toc-h3" : "toc-h2"}"><a href="#${i.id}">${i.level === 3 ? "— " : ""}${i.text}</a></li>`
      )
      .join("");

    const tocHtml = `
      <nav data-type="toc" class="article-toc">
        <div class="article-toc-title">📑 Mục Lục Bài Viết</div>
        <ul class="article-toc-list">
          ${listItemsHtml}
        </ul>
      </nav>
      <p></p>
    `.trim();

    editor?.chain().focus().insertContent(tocHtml).run();
  }

  // Clear all inline formatting
  function handleClearFormatting() {
    editor?.chain().focus().unsetAllMarks().clearNodes().run();
  }

  // Handle Indent / Outdent
  function handleIndent() {
    if (editor?.can().sinkListItem("listItem")) {
      editor.chain().focus().sinkListItem("listItem").run();
    } else {
      // If not in a list item, wrap in blockquote or add block quote indentation
      editor?.chain().focus().wrapIn("blockquote").run();
    }
  }

  function handleOutdent() {
    if (editor?.can().liftListItem("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();
    } else if (editor?.isActive("blockquote")) {
      editor.chain().focus().lift("blockquote").run();
    }
  }

  // Word count & estimated reading time
  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0">
      {/* WARNING IF H1 IN BODY */}
      {hasH1 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-bold text-amber-800 flex items-center justify-between gap-2">
          <span>⚠️ Cảnh báo SEO: Phát hiện thẻ H1 trong nội dung. Tiêu đề bài viết đã là H1 duy nhất, bạn nên chuyển các tiêu đề trong bài về H2 hoặc H3.</span>
          <button
            type="button"
            onClick={() => {
              const fixed = (editor?.getHTML() || "")
                .replace(/<h1(\b[^>]*)>/gi, "<h2$1>")
                .replace(/<\/h1>/gi, "</h2>");
              editor?.commands.setContent(fixed);
            }}
            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-extrabold hover:bg-amber-700 transition shrink-0"
          >
            Chuyển hết H1 → H2
          </button>
        </div>
      )}

      {/* TIPTAP FULL TOOLBAR */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 1. UNDO / REDO */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
              title="Hoàn tác (Undo Ctrl+Z)"
            >
              ↩️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer"
              title="Làm lại (Redo Ctrl+Y)"
            >
              ↪️
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 2. HEADINGS (PARAGRAPH, H2, H3) */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                editor.isActive("paragraph") ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Đoạn văn thường (P)"
            >
              P
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer font-extrabold ${
                editor.isActive("heading", { level: 2 }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Tiêu đề chính H2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer font-extrabold ${
                editor.isActive("heading", { level: 3 }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Tiêu đề phụ H3"
            >
              H3
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 3. BOLD / ITALIC / UNDERLINE / STRIKE */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md font-extrabold transition cursor-pointer ${
                editor.isActive("bold") ? "bg-sky-600 text-white" : "text-slate-800 hover:bg-slate-100"
              }`}
              title="In đậm (Ctrl+B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md italic font-extrabold transition cursor-pointer ${
                editor.isActive("italic") ? "bg-sky-600 text-white" : "text-slate-800 hover:bg-slate-100"
              }`}
              title="In nghiêng (Ctrl+I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md underline font-extrabold transition cursor-pointer ${
                editor.isActive("underline") ? "bg-sky-600 text-white" : "text-slate-800 hover:bg-slate-100"
              }`}
              title="Gạch chân (Ctrl+U)"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md line-through font-extrabold transition cursor-pointer ${
                editor.isActive("strike") ? "bg-sky-600 text-white" : "text-slate-800 hover:bg-slate-100"
              }`}
              title="Gạch ngang chữ (Strike)"
            >
              S
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 4. TEXT ALIGNMENT (LEFT, CENTER, RIGHT, JUSTIFY) */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition cursor-pointer ${
                editor.isActive({ textAlign: "left" }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Căn lề trái"
            >
              ⬅️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition cursor-pointer ${
                editor.isActive({ textAlign: "center" }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Căn giữa"
            >
              ↔️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition cursor-pointer ${
                editor.isActive({ textAlign: "right" }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Căn lề phải"
            >
              ➡️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition cursor-pointer ${
                editor.isActive({ textAlign: "justify" }) ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Căn đều hai bên"
            >
              📑
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 5. LISTS & QUOTE */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                editor.isActive("bulletList") ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Danh sách chấm"
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                editor.isActive("orderedList") ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Danh sách số"
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                editor.isActive("blockquote") ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Đoạn trích dẫn"
            >
              ❝ Quote
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 6. INDENT / OUTDENT */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={handleOutdent}
              className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Giảm thụt lề (Outdent)"
            >
              ◀️
            </button>
            <button
              type="button"
              onClick={handleIndent}
              className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Tăng thụt lề (Indent)"
            >
              ▶️
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 7. LINKS & INTERNAL LINKS */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={openLinkModal}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("link") ? "bg-sky-600 text-white" : "text-sky-700 hover:bg-sky-50"
              }`}
              title="Chèn liên kết ngoài / nâng cao"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => {
                setInternalSearchQuery("");
                setInternalLinkModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 transition cursor-pointer flex items-center gap-1 font-extrabold border border-sky-200"
              title="Liên kết nội bộ (Internal Link SEO)"
            >
              ⚡ Liên kết nội bộ
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 8. IMAGE & TABLE */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-800 transition cursor-pointer flex items-center gap-1"
              title="Chèn ảnh có ALT & Chú thích"
            >
              🖼️ Ảnh
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                editor.isActive("table") ? "bg-sky-600 text-white" : "hover:bg-slate-100 text-slate-800"
              }`}
              title="Chèn bảng dữ liệu (3x3)"
            >
              📊 Bảng
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 9. CTA & INFO BOX */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCtaModalOpen(true)}
              className="px-2.5 py-1 rounded-md hover:bg-amber-50 text-amber-900 transition cursor-pointer flex items-center gap-1 border border-amber-200"
              title="Chèn nút kêu gọi hành động CTA"
            >
              📣 CTA
            </button>
            <button
              type="button"
              onClick={() => setInfoBoxModalOpen(true)}
              className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-800 transition cursor-pointer flex items-center gap-1"
              title="Chèn hộp thông tin / Lưu ý / Cảnh báo"
            >
              💡 Info Box
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 10. PROJECT & LISTING CARDS */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setProjectSearch("");
                setProjectModalOpen(true);
              }}
              className="px-2 py-1 rounded-md hover:bg-sky-50 text-sky-800 transition cursor-pointer flex items-center gap-1"
              title="Chèn card giới thiệu Dự án"
            >
              🏢 Dự án
            </button>
            <button
              type="button"
              onClick={() => {
                setListingSearch("");
                setListingModalOpen(true);
              }}
              className="px-2 py-1 rounded-md hover:bg-emerald-50 text-emerald-800 transition cursor-pointer flex items-center gap-1"
              title="Chèn card Bất động sản"
            >
              🏠 BĐS
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 11. HR & TOC */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Đường kẻ ngang"
            >
              ―
            </button>
            <button
              type="button"
              onClick={handleInsertTableOfContents}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1 font-extrabold"
              title="Tự động tạo mục lục từ H2 / H3"
            >
              📑 Mục lục
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          {/* 12. CLEAR FORMATTING */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={handleClearFormatting}
              className="px-2.5 py-1 rounded-md text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer flex items-center gap-1"
              title="Xóa định dạng (Clear formatting)"
            >
              🧹 Xóa định dạng
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CONTEXT CONTROLS BAR (WHEN TABLE IS SELECTED) */}
      {editor.isActive("table") && (
        <div className="bg-sky-50/80 border-b border-sky-200 p-2 flex flex-wrap items-center gap-1 text-[11px] font-bold text-sky-900">
          <span className="text-sky-700 mr-1 flex items-center gap-1">📊 Thao tác bảng:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-sky-200 cursor-pointer"
          >
            + Dòng dưới
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
          >
            - Xóa dòng
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-sky-200 cursor-pointer"
          >
            + Cột phải
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
          >
            - Xóa cột
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-sky-100 border border-sky-200 cursor-pointer"
          >
            Bật/tắt Header
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-0.5 rounded bg-rose-600 text-white hover:bg-rose-700 font-extrabold cursor-pointer ml-auto"
          >
            Xóa bảng
          </button>
        </div>
      )}

      {/* MAIN EDITOR CONTENT */}
      <EditorContent editor={editor} />

      {/* FOOTER STATS */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div className="flex items-center gap-3">
          <span>Trình soạn thảo chuẩn SEO (Khóa H1, cho phép H2 & H3)</span>
        </div>
        <div className="flex items-center gap-3 font-bold text-slate-700">
          <span>{wordCount} từ</span>
          <span>·</span>
          <span>khoảng {readingTimeMin} phút đọc</span>
        </div>
      </div>

      {/* ========================================================
          MODALS
         ======================================================== */}

      {/* 1. INTERNAL LINK PICKER MODAL */}
      {internalLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-extrabold text-slate-900 text-sm">Chèn Liên Kết Nội Bộ (Internal Link)</h3>
              </div>
              <button
                type="button"
                onClick={() => setInternalLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* SEARCH INPUT & FILTER TABS */}
            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Gõ tìm kiếm tên dự án, bất động sản, bài viết hoặc trang..."
                value={internalSearchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
                className="input text-xs"
              />
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {(["ALL", "PROJECT", "LISTING", "NEWS", "PAGE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInternalTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                      internalTypeFilter === t
                        ? "bg-sky-600 text-white font-extrabold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t === "ALL"
                      ? "Tất cả"
                      : t === "PROJECT"
                      ? "Dự án"
                      : t === "LISTING"
                      ? "Bất động sản"
                      : t === "NEWS"
                      ? "Tin tức"
                      : "Trang hệ thống"}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar min-h-[220px] max-h-[320px] pr-1">
              {internalSearching ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">⏳ Đang tìm kiếm liên kết...</div>
              ) : internalResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy kết quả phù hợp.</div>
              ) : (
                internalResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInsertInternalLink(item)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            item.type === "PROJECT"
                              ? "bg-sky-100 text-sky-800"
                              : item.type === "LISTING"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.type === "NEWS"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 truncate">
                          {item.title}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{item.url}</div>
                      {item.subtitle && <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>}
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 text-xs font-bold text-slate-700 shrink-0 transition"
                    >
                      Chọn ↵
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ADVANCED LINK MODAL */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">🔗 Chỉnh Sửa Liên Kết (Link)</h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Văn bản hiển thị (Anchor text)</label>
                <input
                  type="text"
                  placeholder="Văn bản liên kết..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Đường dẫn URL liên kết</label>
                <input
                  type="url"
                  placeholder="https://... hoặc /projects/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="input text-xs font-mono"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Mở trong tab mới (target=&quot;_blank&quot;)</span>
                </label>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Thuộc tính SEO (rel):</label>
                  <select
                    value={linkRel}
                    onChange={(e) => setLinkRel(e.target.value as any)}
                    className="input text-xs"
                  >
                    <option value="">Chuẩn (Dofollow / Standard)</option>
                    <option value="nofollow">rel=&quot;nofollow&quot; (Không truyền PageRank)</option>
                    <option value="sponsored">rel=&quot;sponsored&quot; (Liên kết tài trợ/quảng cáo)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                  setLinkModalOpen(false);
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Gỡ liên kết
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveLink}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-sm"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. IMAGE WITH ALT & CAPTION MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">🖼️ Chèn Hình Ảnh Chuẩn SEO (ALT & Caption)</h3>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* TAB SELECT */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageTab("UPLOAD")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  imageTab === "UPLOAD" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                📤 Tải ảnh từ máy
              </button>
              <button
                type="button"
                onClick={() => setImageTab("URL")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  imageTab === "URL" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                🌐 Nhập URL ảnh
              </button>
            </div>

            <div className="space-y-3">
              {imageTab === "UPLOAD" ? (
                <div>
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => imageFileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-sky-50/40 transition cursor-pointer"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {uploadingImage ? uploadStatus : "Bấm để chọn file ảnh từ máy tính"}
                    </span>
                    <span className="text-[11px] text-slate-400">Tự động nén & tối ưu chuẩn web</span>
                  </button>
                  <input
                    type="file"
                    ref={imageFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                  {imageUrl && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 truncate">
                      ✅ Đã tải ảnh: {imageUrl}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input text-xs font-mono"
                  />
                </div>
              )}

              {/* ALT TEXT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Thẻ ALT (Mô tả ảnh cho SEO Google)</label>
                  <span className="text-[10px] text-sky-600 font-bold">*Khuyên dùng</span>
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: Phối cảnh tổng thể dự án Altara Residences Quy Nhơn..."
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="input text-xs"
                />
              </div>

              {/* CAPTION */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chú thích ảnh (Caption dưới ảnh)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hình ảnh thực tế căn hộ mẫu tầng 20..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="input text-xs"
                />
              </div>

              {/* ALIGNMENT */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Căn lề hiển thị</label>
                <div className="flex items-center gap-2">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setImageAlign(a)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer capitalize ${
                        imageAlign === a ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {a === "left" ? "Căn trái" : a === "center" ? "Căn giữa" : "Căn phải"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-sm"
              >
                Chèn ảnh vào bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CTA BLOCK MODAL */}
      {ctaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">📣 Chèn Khối Kêu Gọi Hành Động (CTA Block)</h3>
              <button
                type="button"
                onClick={() => setCtaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PRESETS */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mẫu CTA sẵn có</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: "Xem bảng hàng chi tiết", url: "/listings" },
                  { text: "Xem dự án nổi bật", url: "/projects" },
                  { text: "Ký gửi bất động sản", url: "/ky-gui" },
                  { text: "Nhận tư vấn miễn phí 24/7", url: "/lien-he" },
                ].map((p) => (
                  <button
                    key={p.text}
                    type="button"
                    onClick={() => {
                      setCtaText(p.text);
                      setCtaUrl(p.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition"
                  >
                    + {p.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nội dung nút bấm (Text)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="input text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Đường dẫn URL đích</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giao diện (Style)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCtaVariant("sky")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      ctaVariant === "sky" ? "bg-sky-600 text-white border-sky-600" : "bg-sky-50 text-sky-800 border-sky-200"
                    }`}
                  >
                    Sky Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtaVariant("dark")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      ctaVariant === "dark" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    Dark Luxury
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtaVariant("emerald")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      ctaVariant === "emerald" ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    Emerald
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCtaModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertCta}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-sm"
              >
                Chèn CTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. INFO BOX MODAL */}
      {infoBoxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">💡 Chèn Hộp Chú Thích (Info Box)</h3>
              <button
                type="button"
                onClick={() => setInfoBoxModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Loại thông báo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInfoBoxVariant("info")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      infoBoxVariant === "info" ? "bg-sky-600 text-white border-sky-600" : "bg-sky-50 text-sky-800 border-sky-200"
                    }`}
                  >
                    💡 Thông tin
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoBoxVariant("warning")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      infoBoxVariant === "warning" ? "bg-amber-600 text-white border-amber-600" : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    ⚠️ Lưu ý
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoBoxVariant("alert")}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      infoBoxVariant === "alert" ? "bg-rose-600 text-white border-rose-600" : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    🚨 Cảnh báo
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tiêu đề hộp</label>
                <input
                  type="text"
                  value={infoBoxTitle}
                  onChange={(e) => setInfoBoxTitle(e.target.value)}
                  className="input text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={3}
                  value={infoBoxContent}
                  onChange={(e) => setInfoBoxContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInfoBoxModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertInfoBox}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition shadow-sm"
              >
                Chèn Hộp chú thích
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROJECT EMBED MODAL */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">🏢 Chọn Dự Án Nhúng Vào Bài Viết</h3>
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Tìm kiếm dự án theo tên hoặc chủ đầu tư..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="input text-xs"
            />

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar min-h-[220px] max-h-[320px] pr-1">
              {projectLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">⏳ Đang tìm dự án...</div>
              ) : projectResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy dự án nào.</div>
              ) : (
                projectResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleInsertProjectCard(p)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.thumbnail || "/logo.png"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700 truncate">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{p.subtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 text-xs font-bold text-slate-700 shrink-0 transition"
                    >
                      Chèn card ↵
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. LISTING EMBED MODAL */}
      {listingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">🏠 Chọn Bất Động Sản Nhúng Vào Bài Viết</h3>
              <button
                type="button"
                onClick={() => setListingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Tìm kiếm BĐS theo tiêu đề, mã sản phẩm hoặc dự án..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              className="input text-xs"
            />

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar min-h-[220px] max-h-[320px] pr-1">
              {listingLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">⏳ Đang tìm BĐS...</div>
              ) : listingResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy BĐS nào.</div>
              ) : (
                listingResults.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => handleInsertListingCard(l)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.thumbnail || "/logo.png"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">{l.title}</h4>
                        <p className="text-[11px] text-emerald-700 font-semibold truncate">{l.subtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 text-xs font-bold text-slate-700 shrink-0 transition"
                    >
                      Chèn card ↵
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
