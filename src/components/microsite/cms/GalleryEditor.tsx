"use client";

import React, { useRef, useState } from "react";
import { GalleryItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";
import { compressImage } from "@/lib/imageCompression";

interface GalleryEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: GalleryItem[];
  onItemsChange: (items: GalleryItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function GalleryEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: GalleryEditorProps) {
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  function handleAddItem() {
    const newItem: GalleryItem = {
      id: "gallery-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      image: "",
      caption: "",
      alt: "",
      sortOrder: items.length,
    };
    onItemsChange([...items, newItem]);
  }

  function handleDeleteItem(index: number) {
    const updated = items.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, sortOrder: idx }));
    onItemsChange(updated);
  }

  async function handleBatchUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBatchUploading(true);
    const newItems: GalleryItem[] = [];
    const fileList = Array.from(files);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBatchProgress(`Đang tải ảnh ${i + 1}/${fileList.length}: ${file.name}...`);
      try {
        const opt = await compressImage(file, "GALLERY");
        const fd = new FormData();
        fd.append("file", opt.file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          newItems.push({
            id: "gallery-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
            image: data.url,
            caption: "",
            alt: `${projectName} - Hình ảnh thực tế`,
            sortOrder: items.length + newItems.length,
          });
        }
      } catch (err) {
        console.error("Lỗi upload ảnh trong batch:", err);
      }
    }

    if (newItems.length > 0) {
      onItemsChange([...items, ...newItems]);
    }
    setBatchUploading(false);
    setBatchProgress("");
    if (batchInputRef.current) {
      batchInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeaderFields
        title={title}
        onTitleChange={onTitleChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        titleLabel="Tiêu đề Section Thư Viện Ảnh"
        titlePlaceholder="VD: Bộ Sưu Tập Hình Ảnh Thực Tế & Tiến Độ"
        descriptionLabel="Mô tả Section Thư Viện Ảnh"
        descriptionPlaceholder="VD: Chiêm ngưỡng không gian cảnh quan, tiện ích và phối cảnh thực tế..."
        disabled={disabled}
      />

      <div className="space-y-3">
        {/* HEADER VÀ BATCH UPLOAD */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Hình ảnh trong bộ sưu tập ({items.length} ảnh)
          </label>

          {!disabled && (
            <div>
              <input
                ref={batchInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={batchUploading}
                onChange={handleBatchUpload}
              />
              <button
                type="button"
                onClick={() => batchInputRef.current?.click()}
                disabled={batchUploading}
                className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 font-bold"
              >
                {batchUploading ? <span className="animate-spin">⏳</span> : <span>📁</span>}
                <span>{batchUploading ? batchProgress : "Tải lên hàng loạt nhiều ảnh (+)"}</span>
              </button>
            </div>
          )}
        </div>

        {batchProgress && (
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold animate-pulse border border-sky-200">
            {batchProgress}
          </div>
        )}

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm 1 ảnh mới"
          disabled={disabled}
          itemTitleRenderer={(item) => (
            <span className="truncate max-w-[280px]">
              {item.caption || item.alt || "Ảnh chưa có chú thích"}
            </span>
          )}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chú thích ảnh (Caption - tùy chọn)</label>
                  <input
                    type="text"
                    value={item.caption || ""}
                    onChange={(e) => updateItem({ caption: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Phối cảnh sảnh đón đón tiếp khách 5 sao"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thẻ Alt SEO (Mô tả tìm kiếm ảnh)</label>
                  <input
                    type="text"
                    value={item.alt || ""}
                    onChange={(e) => updateItem({ alt: e.target.value })}
                    disabled={disabled}
                    placeholder={`${projectName} - ${item.caption || "Hình ảnh thực tế"}`}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Tải ảnh lên hoặc nhập URL"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.caption || "Hình ảnh thực tế"}`}
                  preset="GALLERY"
                  disabled={disabled}
                  aspectRatio="aspect-[16/10]"
                  showAltField={false}
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
