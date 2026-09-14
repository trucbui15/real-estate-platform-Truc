"use client";

import React from "react";
import { VideoItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface VideoTourEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: VideoItem[];
  onItemsChange: (items: VideoItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function VideoTourEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: VideoTourEditorProps) {
  function handleAddItem() {
    const newItem: VideoItem = {
      id: "video-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: "",
      url: "",
      thumbnail: "",
      alt: "",
      type: "YOUTUBE",
      sortOrder: items.length,
    };
    onItemsChange([...items, newItem]);
  }

  function handleDeleteItem(index: number) {
    const updated = items.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, sortOrder: idx }));
    onItemsChange(updated);
  }

  function detectTypeFromUrl(url: string): "YOUTUBE" | "TOUR_360" | "VIDEO" {
    const lower = url.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      return "YOUTUBE";
    }
    if (lower.includes("360") || lower.includes("matterport") || lower.includes("kuula") || lower.includes("vr") || lower.includes("virtual-tour")) {
      return "TOUR_360";
    }
    return "VIDEO";
  }

  return (
    <div className="space-y-5">
      <SectionHeaderFields
        title={title}
        onTitleChange={onTitleChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        titleLabel="Tiêu đề Section Video & Tour 360°"
        titlePlaceholder="VD: Video Trải Nghiệm & Tour Thực Tế Ảo 360°"
        descriptionLabel="Mô tả Section Video & Tour 360°"
        descriptionPlaceholder="VD: Khám phá không gian thực tế dự án từ mọi góc nhìn sống động..."
        disabled={disabled}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Danh sách Video & Tour 360 ({items.length} mục)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm Video / Tour 360"
          disabled={disabled}
          itemTitleRenderer={(item) => (
            <span className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.type === "YOUTUBE" ? "bg-red-50 text-red-700 border border-red-200" :
                item.type === "TOUR_360" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                "bg-purple-50 text-purple-700 border border-purple-200"
              }`}>
                {item.type === "YOUTUBE" ? "▶ YOUTUBE" : item.type === "TOUR_360" ? "🌐 TOUR 360°" : "🎬 VIDEO FILE"}
              </span>
              <span>{item.title || "Video/Tour chưa đặt tên"}</span>
            </span>
          )}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề Video / Tour *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Trải nghiệm thực tế căn hộ mẫu 2PN View Biển"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại nội dung</label>
                  <select
                    value={item.type || "YOUTUBE"}
                    onChange={(e) => updateItem({ type: e.target.value as any })}
                    disabled={disabled}
                    className="input text-xs bg-white font-bold"
                  >
                    <option value="YOUTUBE">YouTube Video</option>
                    <option value="TOUR_360">Tour 360° / VR Virtual</option>
                    <option value="VIDEO">Video MP4 / Trực tiếp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Đường dẫn Link (URL) *</label>
                <input
                  type="text"
                  value={item.url || ""}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    const detected = detectTypeFromUrl(newUrl);
                    updateItem({
                      url: newUrl,
                      type: item.type && item.type !== "YOUTUBE" ? item.type : detected,
                    });
                  }}
                  disabled={disabled}
                  placeholder="https://www.youtube.com/watch?v=... hoặc link tour 360"
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh đại diện (Thumbnail - Tùy chọn)"
                  value={item.thumbnail || ""}
                  onChange={(url) => updateItem({ thumbnail: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.title || "Video trải nghiệm"}`}
                  preset="THUMBNAIL"
                  disabled={disabled}
                  aspectRatio="aspect-video"
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
