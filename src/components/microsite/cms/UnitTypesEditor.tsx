"use client";

import React from "react";
import { MicrositeContentItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface UnitTypesEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  items: MicrositeContentItem[];
  onItemsChange: (items: MicrositeContentItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function UnitTypesEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: UnitTypesEditorProps) {
  function handleAddItem() {
    const newItem: MicrositeContentItem = {
      id: "unittype-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: "",
      description: "",
      area: "",
      priceFrom: "",
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
        titleLabel="Tiêu đề Section Loại Căn Hộ"
        titlePlaceholder="VD: Các Loại Hình Căn Hộ & Thiết Kế Mẫu"
        descriptionLabel="Mô tả Section Loại Căn Hộ"
        descriptionPlaceholder="VD: Đa dạng cơ cấu diện tích từ 1PN đến 3PN đáp ứng mọi nhu cầu an cư và đầu tư..."
        disabled={disabled}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Danh sách loại căn hộ ({items.length} loại căn)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm loại căn hộ"
          disabled={disabled}
          itemTitleRenderer={(item) => (
            <span className="flex items-center gap-2">
              <span>{item.title || "Loại căn chưa đặt tên"}</span>
              {item.area && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">{item.area}</span>}
              {item.priceFrom && <span className="text-[10px] text-amber-600 font-bold">Từ {item.priceFrom}</span>}
            </span>
          )}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Tên loại căn *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Căn hộ 2 Phòng Ngủ"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diện tích</label>
                  <input
                    type="text"
                    value={item.area || ""}
                    onChange={(e) => updateItem({ area: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: 68m²"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá bán từ</label>
                  <input
                    type="text"
                    value={item.priceFrom || ""}
                    onChange={(e) => updateItem({ priceFrom: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: 2.1 tỷ"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả thiết kế / Ưu điểm</label>
                <input
                  type="text"
                  value={item.description || ""}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  disabled={disabled}
                  placeholder="VD: Ban công view trực diện biển, 2 phòng ngủ đều đón ánh sáng tự nhiên"
                  className="input text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh phối cảnh / 3D Layout căn hộ"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.title || "Căn hộ mẫu"}`}
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
