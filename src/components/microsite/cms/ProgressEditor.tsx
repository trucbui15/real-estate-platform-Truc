"use client";

import React from "react";
import { MicrositeContentItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface ProgressEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: MicrositeContentItem[];
  onItemsChange: (items: MicrositeContentItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function ProgressEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: ProgressEditorProps) {
  function handleAddItem() {
    const newItem: MicrositeContentItem = {
      id: "progress-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      date: "",
      title: "",
      description: "",
      image: "",
      alt: "",
      sortOrder: items.length,
    };
    onItemsChange([...items, newItem]);
  }

  function handleDeleteItem(index: number) {
    const updated = items.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, sortOrder: idx }));
    onItemsChange(updated);
  }

  return (
    <div className="space-y-5">
      <SectionHeaderFields
        title={title}
        onTitleChange={onTitleChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        titleLabel="Tiêu đề Section Tiến Độ"
        titlePlaceholder="VD: Cập Nhật Tiến Độ Thi Công Dự Án Thực Tế"
        descriptionLabel="Mô tả Section Tiến Độ"
        descriptionPlaceholder="VD: Hình ảnh ghi nhận trực tiếp công trường thi công đúng tiến độ cam kết..."
        disabled={disabled}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Các mốc tiến độ thi công ({items.length} mốc)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm cập nhật tiến độ"
          disabled={disabled}
          itemTitleRenderer={(item) => (
            <span className="flex items-center gap-2">
              {item.date && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {item.date}
                </span>
              )}
              <span>{item.title || "Tiến độ chưa đặt tiêu đề"}</span>
            </span>
          )}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mốc thời gian (Tháng/Năm) *</label>
                  <input
                    type="text"
                    value={item.date || ""}
                    onChange={(e) => updateItem({ date: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Tháng 09/2026"
                    className="input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề mốc tiến độ *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Cất nóc thành công 2 Tòa Tháp The Sea & The Harbour"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết công việc hoàn thành</label>
                <textarea
                  rows={2}
                  value={item.description || ""}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  disabled={disabled}
                  placeholder="VD: Đã hoàn thiện xong kết cấu bê tông cốt thép toàn bộ 29 tầng, đang triển khai thi công ngăn phòng xây thô và hoàn thiện hệ thống cơ điện (MEP)."
                  className="input text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh chụp thực tế công trường"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - Tiến độ ${item.date || ""} ${item.title || ""}`}
                  preset="DEFAULT"
                  disabled={disabled}
                  aspectRatio="aspect-[16/10]"
                />
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
