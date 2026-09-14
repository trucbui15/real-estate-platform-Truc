"use client";

import React, { useState } from "react";

interface SortableItemListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  addLabel?: string;
  itemTitleRenderer?: (item: T, index: number) => React.ReactNode;
  renderItemContent: (item: T, index: number, updateItem: (updated: Partial<T>) => void) => React.ReactNode;
  disabled?: boolean;
}

export default function SortableItemList<T extends { id?: string; sortOrder?: number }>({
  items,
  onReorder,
  onAdd,
  onDelete,
  addLabel = "+ Thêm mục mới",
  itemTitleRenderer,
  renderItemContent,
  disabled = false,
}: SortableItemListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function moveItem(index: number, direction: "up" | "down") {
    if (disabled) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Cập nhật lại sortOrder nếu có
    const updated = copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    onReorder(updated);
  }

  function handleDragStart(index: number) {
    if (disabled) return;
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const copy = [...items];
    const [draggedItem] = copy.splice(draggedIndex, 1);
    copy.splice(index, 0, draggedItem);

    const updated = copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function updateItem(index: number, partial: Partial<T>) {
    const copy = [...items];
    copy[index] = { ...copy[index], ...partial };
    onReorder(copy);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 bg-slate-50 space-y-2">
          <p>Chưa có mục nào trong danh sách này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={(item as any).id || index}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`rounded-2xl border transition-all duration-150 bg-white p-4 space-y-3 shadow-2xs ${
                  isDragging
                    ? "opacity-40 border-sky-500 scale-[0.99]"
                    : isOver
                    ? "border-sky-500 ring-2 ring-sky-200"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* ITEM HEADER (DRAG HANDLE, TITLE, UP/DOWN, DELETE) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    {!disabled && (
                      <span
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 select-none p-1 text-base leading-none"
                        title="Kéo thả để đổi thứ tự"
                      >
                        ⠿
                      </span>
                    )}

                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-mono">
                        #{index + 1}
                      </span>
                      {itemTitleRenderer ? itemTitleRenderer(item, index) : null}
                    </span>
                  </div>

                  {/* ACTION CONTROLS */}
                  {!disabled && (
                    <div className="flex items-center gap-1">
                      {/* MOVE UP */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        aria-label="Di chuyển lên"
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer text-xs"
                        title="Di chuyển lên"
                      >
                        ↑
                      </button>

                      {/* MOVE DOWN */}
                      <button
                        type="button"
                        onClick={() => moveItem(index, "down")}
                        disabled={index === items.length - 1}
                        aria-label="Di chuyển xuống"
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-20 transition cursor-pointer text-xs"
                        title="Di chuyển xuống"
                      >
                        ↓
                      </button>

                      <div className="h-3 w-px bg-slate-200 mx-1" />

                      {/* DELETE ITEM */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa mục #${index + 1} này không?`)) {
                            onDelete(index);
                          }
                        }}
                        aria-label="Xóa mục này"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md text-[11px] font-bold transition cursor-pointer"
                        title="Xóa mục"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>

                {/* ITEM BODY */}
                <div className="pt-1">
                  {renderItemContent(item, index, (updated) => updateItem(index, updated))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD ITEM BUTTON */}
      {!disabled && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-50 text-sky-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <span>✨</span>
          <span>{addLabel}</span>
        </button>
      )}
    </div>
  );
}
