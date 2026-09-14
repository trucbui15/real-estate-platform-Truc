"use client";

import React from "react";

interface SectionHeaderFieldsProps {
  title: string;
  onTitleChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  titleLabel?: string;
  titlePlaceholder?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  disabled?: boolean;
}

export default function SectionHeaderFields({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  titleLabel = "Tiêu đề Section",
  titlePlaceholder = "Nhập tiêu đề hiển thị...",
  descriptionLabel = "Mô tả ngắn Section",
  descriptionPlaceholder = "Nhập mô tả giới thiệu tổng quan...",
  disabled = false,
}: SectionHeaderFieldsProps) {
  return (
    <div className="space-y-3 border-b border-slate-200 pb-4 text-xs">
      <div>
        <label className="font-bold text-slate-800 block mb-1">{titleLabel}</label>
        <input
          type="text"
          value={title || ""}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          placeholder={titlePlaceholder}
          className="input text-xs"
        />
      </div>

      <div>
        <label className="font-bold text-slate-800 block mb-1">{descriptionLabel}</label>
        <textarea
          rows={2}
          value={description || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
          placeholder={descriptionPlaceholder}
          className="input text-xs"
        />
      </div>
    </div>
  );
}
