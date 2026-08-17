"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";

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
  const [uploading, setUploading] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // CẤM H1: Chỉ cho phép H2 và H3 trong body
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-sky-600 underline font-semibold hover:text-sky-800",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "my-4 rounded-2xl max-w-full h-auto shadow-md mx-auto block border border-slate-200",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[380px] p-5 focus:outline-none text-slate-800 text-sm sm:text-base leading-relaxed bg-white rounded-b-2xl",
      },
    },
  });

  // Sync external value when changing article
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[380px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        ⏳ Đang khởi tạo trình soạn thảo Tiptap...
      </div>
    );
  }

  async function handleMediaUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "h8s6hyxc";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "minhdungland";

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileUrl = "";

        // 1. Direct Cloudinary Upload
        try {
          const cloudFd = new FormData();
          cloudFd.append("file", file);
          cloudFd.append("upload_preset", uploadPreset);

          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: cloudFd,
          });

          if (cloudRes.ok) {
            const cloudData = await cloudRes.json();
            if (cloudData.secure_url) fileUrl = cloudData.secure_url;
          }
        } catch (e) {
          console.warn("Direct Cloudinary failed, falling back to /api/upload", e);
        }

        // 2. Fallback /api/upload
        if (!fileUrl) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          const data = await res.json();
          if (res.ok && data.url) fileUrl = data.url;
        }

        if (fileUrl) {
          editor?.chain().focus().setImage({ src: fileUrl, alt: file.name }).run();
        }
      }
    } catch (err) {
      alert("Tải ảnh chèn vào bài viết thất bại");
    } finally {
      setUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
    }
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Nhập đường dẫn URL liên kết:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* TIPTAP TOOLBAR */}
      <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* HEADING DROPDOWN (ONLY H2 & H3) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("paragraph")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Đoạn văn (P)
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("heading", { level: 2 })
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Tiêu đề H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("heading", { level: 3 })
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Tiêu đề H3
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* BOLD / ITALIC */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 rounded-lg font-extrabold text-xs transition cursor-pointer border flex items-center justify-center ${
              editor.isActive("bold")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
            title="In đậm (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 rounded-lg font-extrabold italic text-xs transition cursor-pointer border flex items-center justify-center ${
              editor.isActive("italic")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
            title="In nghiêng (Ctrl+I)"
          >
            I
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* LISTS */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("bulletList")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title="Danh sách chấm"
          >
            • Danh sách
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("orderedList")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title="Danh sách số"
          >
            1. Danh sách
          </button>

          {/* BLOCKQUOTE */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition cursor-pointer border ${
              editor.isActive("blockquote")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
            title="Trích dẫn"
          >
            ❝ Quote
          </button>

          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* LINK */}
          <button
            type="button"
            onClick={setLink}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer border flex items-center gap-1 ${
              editor.isActive("link")
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-sky-700 border-slate-200 hover:bg-sky-50"
            }`}
            title="Chèn liên kết"
          >
            🔗 Link
          </button>

          {/* INLINE IMAGE UPLOAD */}
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={uploading}
            className="px-2.5 py-1 text-xs rounded-lg font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1"
          >
            <span>📷</span>
            <span>{uploading ? "Đang tải..." : "Chèn ảnh"}</span>
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

        {/* UNDO / REDO */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-2 py-1 text-xs rounded-lg font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-40"
            title="Hoàn tác (Ctrl+Z)"
          >
            ↩️ Undo
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-2 py-1 text-xs rounded-lg font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-40"
            title="Làm lại (Ctrl+Y)"
          >
            ↪️ Redo
          </button>
        </div>
      </div>

      {/* EDITOR CANVAS */}
      <EditorContent editor={editor} />

      {/* FOOTER STATS */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>Trình soạn thảo Tiptap (Khóa H1, cho phép H2 & H3)</div>
        <div>
          Số từ: {editor.getText().trim().split(/\s+/).filter(Boolean).length} từ
        </div>
      </div>
    </div>
  );
}
