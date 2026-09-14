"use client";

import React from "react";
import { MicrositeContentItem } from "./types";
import SectionHeaderFields from "./SectionHeaderFields";
import SortableItemList from "./SortableItemList";
import ImageUploadField from "./ImageUploadField";

interface SalesPolicyEditorProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  pdfUrl?: string;
  onPdfUrlChange?: (val: string) => void;
  items: MicrositeContentItem[];
  onItemsChange: (items: MicrositeContentItem[]) => void;
  projectName?: string;
  disabled?: boolean;
}

export default function SalesPolicyEditor({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  pdfUrl = "",
  onPdfUrlChange,
  items,
  onItemsChange,
  projectName = "Dự án",
  disabled = false,
}: SalesPolicyEditorProps) {
  function handleAddItem() {
    const newItem: MicrositeContentItem = {
      id: "policy-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: "",
      description: "",
      image: "",
      alt: "",
      link: "",
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
        titleLabel="Tiêu đề Section Chính Sách"
        titlePlaceholder="VD: Chính Sách Bán Hàng & Tiến Độ Thanh Toán Độc Quyền"
        descriptionLabel="Tóm tắt chương trình ưu đãi chung"
        descriptionPlaceholder="VD: Chiết khấu lên tới 10% khi thanh toán sớm. Hỗ trợ lãi suất 0% và ân hạn nợ gốc 24 tháng..."
        disabled={disabled}
      />

      {/* PDF URL FIELD (Tùy chọn) */}
      {onPdfUrlChange && (
        <div className="text-xs space-y-1">
          <label className="font-bold text-slate-700 block">Đường dẫn file PDF chính sách (Tùy chọn)</label>
          <input
            type="text"
            value={pdfUrl || ""}
            onChange={(e) => onPdfUrlChange(e.target.value)}
            disabled={disabled}
            placeholder="https://...link file PDF chính sách bán hàng"
            className="input text-xs font-mono"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Các gói chính sách & ưu đãi ({items.length} gói)
          </label>
        </div>

        <SortableItemList
          items={items}
          onReorder={onItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItem}
          addLabel="+ Thêm chính sách ưu đãi"
          disabled={disabled}
          itemTitleRenderer={(item) => <span>{item.title || "Chính sách chưa đặt tên"}</span>}
          renderItemContent={(item, index, updateItem) => (
            <div className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên gói chính sách / Ưu đãi *</label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    disabled={disabled}
                    placeholder="VD: Chiết khấu 8% thanh toán chuẩn"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đường dẫn chi tiết / Tải tài liệu (Tùy chọn)</label>
                  <input
                    type="text"
                    value={item.link || ""}
                    onChange={(e) => updateItem({ link: e.target.value })}
                    disabled={disabled}
                    placeholder="https://... hoặc #contact"
                    className="input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả nội dung chi tiết gói ưu đãi</label>
                <textarea
                  rows={2}
                  value={item.description || ""}
                  onChange={(e) => updateItem({ description: e.target.value })}
                  disabled={disabled}
                  placeholder="VD: Áp dụng cho khách hàng thanh toán theo tiến độ thông thường 8 đợt, mỗi đợt 10% đến khi nhận nhà."
                  className="input text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Ảnh minh họa / Banner ưu đãi (Tùy chọn)"
                  value={item.image || ""}
                  onChange={(url) => updateItem({ image: url })}
                  altValue={item.alt || ""}
                  onAltChange={(alt) => updateItem({ alt })}
                  suggestedAlt={`${projectName} - ${item.title || "Chính sách ưu đãi"}`}
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
