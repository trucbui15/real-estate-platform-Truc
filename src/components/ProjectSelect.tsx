"use client";
import { useEffect, useState, useRef } from "react";

interface Project {
  id: string;
  name: string;
  slug: string;
  provinceId?: string | null;
  districtId?: string | null;
}

interface ProjectSelectProps {
  value?: string;
  onChange: (projectId: string, project?: Project) => void;
  provinceId?: string;
  districtId?: string;
  disabled?: boolean;
  required?: boolean;
  allowNoProject?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function ProjectSelect({
  value = "",
  onChange,
  provinceId,
  districtId,
  disabled = false,
  required = false,
  allowNoProject = true,
  error,
  placeholder = "Chọn hoặc tìm dự án...",
  className = "",
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (provinceId) params.set("provinceId", provinceId);
        if (districtId) params.set("districtId", districtId);
        params.set("isActive", "true");

        const res = await fetch(`/api/projects?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Lỗi tải dự án:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [provinceId, districtId]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if current value exists in loaded projects
  const selectedProject = projects.find((p) => p.id === value);

  // Filtered projects by search input
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  function handleSelect(id: string, proj?: Project) {
    onChange(id, proj);
    setIsOpen(false);
    setSearchTerm("");
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`input cursor-pointer flex items-center justify-between min-h-[42px] ${
          disabled ? "bg-sand-50 opacity-60 cursor-not-allowed" : ""
        } ${error ? "border-red-500" : ""}`}
      >
        <span className={selectedProject || (allowNoProject && value === "NONE") ? "text-brand-900 font-medium" : "text-sand-400"}>
          {value === "NONE"
            ? "-- Không thuộc dự án --"
            : selectedProject
            ? selectedProject.name
            : placeholder}
        </span>
        <span className="text-xs text-sand-400 ml-2">▼</span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-sand-200 bg-white shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
          <input
            type="text"
            className="input text-xs w-full mb-1 py-1.5 px-2"
            placeholder="Nhập tên dự án để tìm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          {loading ? (
            <div className="py-2 text-center text-xs text-brand-400">Đang tải danh sách dự án...</div>
          ) : (
            <>
              {allowNoProject && (
                <div
                  onClick={() => handleSelect("NONE")}
                  className={`px-3 py-2 text-xs rounded cursor-pointer hover:bg-sand-100 ${
                    value === "NONE" ? "bg-brand-50 text-brand-700 font-semibold" : "text-brand-700"
                  }`}
                >
                  -- Không thuộc dự án --
                </div>
              )}

              {filteredProjects.length === 0 ? (
                <div className="py-2 text-center text-xs text-brand-400">Không tìm thấy dự án phù hợp</div>
              ) : (
                filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p.id, p)}
                    className={`px-3 py-2 text-xs rounded cursor-pointer hover:bg-sand-100 ${
                      value === p.id ? "bg-brand-50 text-brand-700 font-semibold" : "text-brand-900"
                    }`}
                  >
                    {p.name}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
