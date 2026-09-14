"use client";

import React from "react";
import { MicrositeContentItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface AmenitiesEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: MicrositeContentItem[];
  onItemsChange: (items: MicrositeContentItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function AmenitiesEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: AmenitiesEditorProps) {
  function handleAddItem() {
    const newItem: MicrositeContentItem = {
      id: "amenity-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
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
        titleLabel="Tiêu đề Section Tiện ích"
        titlePlaceholder="VD: Hệ Thống Tiện Ích Đẳng Cấp Độc Bản"
        descriptionLabel="Mô tả chung Section Tiện ích"
        descriptionPlaceholder="VD: Trải nghiệm chuỗi tiện ích 5 sao nâng tầm giá trị sống thượng lưu..."
        disabled={disabled}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Danh sách các tiện ích ({items.length} tiện ích)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm tiện ích mới"
          disabled={disabled}
          itemTitleRenderer={(item) => <span>{item.title || "Tiện ích chưa đặt tên"}</span>}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên tiện ích *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Hồ bơi vô cực ngắm biển"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => updateItem({ description: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Tầm nhìn panorama 360 độ ngắm vịnh biển"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh tiện ích"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.title || "Tiện ích"}`}
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
