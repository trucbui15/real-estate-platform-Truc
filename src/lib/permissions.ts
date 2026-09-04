// Bảng phân quyền trung tâm — chỉnh sửa ở đây sẽ áp dụng cho toàn hệ thống
// (API routes + Server Components + UI đều import từ file này để đồng nhất logic)

export type Role = "ADMIN" | "MANAGER" | "STAFF" | "COLLABORATOR_PRO" | "CUSTOMER";

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
  COLLABORATOR_PRO: "CTV Pro",
  CUSTOMER: "Khách hàng",
};

// 1. Quản lý tài khoản người dùng
export const canManageUsers = (role?: Role | string) => role === "ADMIN"; // Chỉ Admin mới tạo/quản lý tài khoản nội bộ

// 2. Bảo mật mã căn (unitCode)
// CTV Pro tuyệt đối bị cấm xem mã căn thật (server trả về null / omit field)
export const isDeniedUnitCode = (role?: Role | string) => role === "COLLABORATOR_PRO";
// Admin, Manager, Staff được xem mã căn nội bộ
export const canViewInternalUnitCode = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF";

// 3. Quản lý Bảng hàng (ProjectInventory)
// Chỉ Admin, Manager, Staff mới được thêm/sửa/xóa bảng hàng. CTV Pro chỉ xem ở chế độ Read-only (đã ẩn mã căn)
export const canManageInventory = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF";

// 4. Quản lý Dự án, Tài liệu, Website CMS & Tin tức
export const canManageProjectContent = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canManageProjectResources = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canManageProjectWebsite = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canManageNews = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canManageProjectsAndNews = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

// 5. Quản lý Tin đăng BĐS (Listing)
export const canManageAllListings = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Quản lý: sửa/xoá MỌI tin

export const canCreateListing = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canEditListing = (
  role: Role | string | undefined,
  authorId: string,
  userId?: string
) => canManageAllListings(role) || ((role === "STAFF" || role === "COLLABORATOR_PRO") && authorId === userId);

export const canApproveListing = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Duyệt tin trước khi public

// 6. Quản lý Khách hàng (CRM)
export const canAccessCRM = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

export const canManageAllCustomers = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager xem TOÀN BỘ danh sách lead

export const canAssignCustomers = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager được đổi người phụ trách

// Backward-compatible aliases
export const canManageCustomers = canAccessCRM;
export const canViewAllCustomers = canManageAllCustomers;

// 7. Quản lý Cộng tác viên (Collaborators)
export const canViewAllCollaborators = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager xem toàn bộ CTV

export const canManageCollaborators = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER"; // Admin & Manager quản lý CTV

// 8. Quyền truy cập Backoffice chung
export const isBackofficeRole = (role?: Role | string) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
