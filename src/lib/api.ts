export * from "./api-core";

export { dashboardApi } from "./api-dashboard";
export { santriApi } from "./api-santri";
export { paymentsApi, invoicesApi } from "./api-payments";
export { tabunganApi, parseBalance } from "./api-tabungan";
export { ppdbApi } from "./api-ppdb";
export { canteenApi } from "./api-canteen";
export { auditApi } from "./api-audit";
export { academicApi, teachersApi } from "./api-academic";
export { counselingApi, counselorsApi } from "./api-counseling";
export { tahfidzApi } from "./api-tahfidz";
export { menuApi } from "./api-menu";
export { roleApi } from "./api-role";

export type { DashboardSummary } from "./api-dashboard";

export type { Santri, Guardian, SantriFormData } from "./api-santri";

export { type Paginated, type ApiResponse, apiFetch } from "./api-core";

export { PaymentMethod, PaymentStatus, InvoiceStatus } from "./api-payments";

export type {
  Payment,
  Invoice,
  CreatePaymentDto,
  UpdatePaymentDto,
  CreateRecurringInvoiceDto,
  DuitkuPaymentResponse,
} from "./api-payments";

export type {
  Savings,
  SavingsBalance,
  SavingsTransaction,
  CreateSavingsRequest,
  CreateTransactionRequest,
  ApproveTransactionRequest,
} from "./api-tabungan";

export type {
  PpdbApplicant,
  PpdbDocument,
  CreatePpdbDto,
  UpdatePpdbStatusDto,
} from "./api-ppdb";

export type {
  Merchant,
  CanteenTransaction,
  CreateMerchantDto,
  CreateCanteenTxDto,
} from "./api-canteen";

export type { AuditTrail, CreateAuditDto } from "./api-audit";

export type {
  AcademicSubject,
  AcademicGrade,
  Attendance,
  CreateSubjectDto,
  CreateGradeDto,
  CreateAttendanceDto,
  Teacher,
} from "./api-academic";

export { AttendanceStatus } from "./api-academic";

export type {
  CounselingSession,
  CreateCounselingDto,
  UpdateCounselingStatusDto,
  Counselor,
} from "./api-counseling";

export { CounselingStatus } from "./api-counseling";

export type {
  TahfidzRecord,
  TahfidzOverviewStats,
  SantriTahfidzStats,
  CreateTahfidzDto,
  UpdateTahfidzDto,
  GetAllTahfidzParams,
  PaginatedTahfidzResponse,
  PaginationMeta,
  DeleteTahfidzResponse,
} from "./api-tahfidz";

export type {
  Menu,
  CreateMenuDto,
  UpdateMenuDto,
  AssignMenuDto,
  Role,
  RoleMenu,
} from "./api-menu";

// Tambahkan export type dari api-role
export type {
  Role as RoleType,
  RolePermission,
  RoleUser,
  RoleMenu as RoleMenuType,
  UpdateRoleDto,
  AssignPermissionDto,
} from "./api-role";
