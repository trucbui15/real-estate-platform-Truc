"use client";

import React from "react";
import { MicrositeContentItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface FloorPlansEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: MicrositeContentItem[];
  onItemsChange: (items: MicrositeContentItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function FloorPlansEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: FloorPlansEditorProps) {
  function handleAddItem() {
    const newItem: MicrositeContentItem = {
      id: "floorplan-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
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
        titleLabel="Tiêu đề Section Mặt Bằng"
        titlePlaceholder="VD: Mặt Bằng Tổng Thể & Tầng Điển Hình"
        descriptionLabel="Mô tả Section Mặt Bằng"
        descriptionPlaceholder="VD: Thiết kế thông minh tối ưu không gian ánh sáng tự nhiên và tầm nhìn biển..."
        disabled={disabled}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Danh sách sơ đồ mặt bằng ({items.length} sơ đồ)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm mục mặt bằng"
          disabled={disabled}
          itemTitleRenderer={(item) => <span>{item.title || "Sơ đồ mặt bằng chưa đặt tên"}</span>}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiêu đề sơ đồ / Phân khu *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Mặt bằng Tầng 5 - 20 (Tòa The Sea)"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả mặt bằng</label>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => updateItem({ description: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Mật độ 12 căn/sàn, 4 thang máy tốc độ cao"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh sơ đồ mặt bằng (Bản vẽ độ phân giải cao)"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.title || "Mặt bằng"}`}
                  preset="FLOOR_PLAN"
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
