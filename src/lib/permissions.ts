// Bảng phân quyền trung tâm — chỉnh sửa ở đây sẽ áp dụng cho toàn hệ thống
// (API routes + UI đều import từ file này để tránh lệch logic)

export type Role = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";

export const canManageUsers = (role?: Role) => role === "ADMIN"; // Chỉ Admin mới tạo/quản lý tài khoản nội bộ

export const canManageAllListings = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Quản lý: sửa/xoá MỌI tin

export const canCreateListing = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF"; // Nhân viên trở lên được đăng tin

export const canEditListing = (
  role: Role | undefined,
  authorId: string,
  userId?: string
) => canManageAllListings(role) || (role === "STAFF" && authorId === userId); // Nhân viên chỉ sửa tin của chính mình

export const canApproveListing = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Duyệt tin trước khi public

export const canManageCustomers = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF"; // Cả 3 vai trò xem/chăm sóc khách

export const canViewAllCustomers = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager xem TOÀN BỘ danh sách lead

export const canAssignCustomers = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager được đổi người phụ trách

export const canViewAllCollaborators = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager xem toàn bộ CTV

export const canManageCollaborators = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager quản lý CTV

export const canManageProjectsAndNews = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER";

export const isBackofficeRole = (role?: Role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF";

