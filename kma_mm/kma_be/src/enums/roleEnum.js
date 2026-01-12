const ROLES = Object.freeze({
  DAO_TAO: 1,
  KHAO_THI: 2,
  QUAN_LI_SINH_VIEN: 3,
  QUAN_LI_THU_VIEN: 4,
  GIAM_DOC: 5,
  SINH_VIEN: 6,
  ADMIN: 7
});

const ROLE_NAMES = Object.freeze({
  [ROLES.DAO_TAO]: "daoTao",
  [ROLES.KHAO_THI]: "khaoThi",
  [ROLES.QUAN_LI_SINH_VIEN]: "quanLiSinhVien",
  [ROLES.QUAN_LI_THU_VIEN]: "quanLiThuVien",
  [ROLES.GIAM_DOC]: "giamDoc",
  [ROLES.SINH_VIEN]: "sinhVien",
  [ROLES.ADMIN]: "admin"
});

const ROLE_LABELS = Object.freeze({
  [ROLES.DAO_TAO]: "Đào Tạo",
  [ROLES.KHAO_THI]: "Khảo Thí",
  [ROLES.QUAN_LI_SINH_VIEN]: "Quản Lý Sinh Viên",
  [ROLES.QUAN_LI_THU_VIEN]: "Quản Lý Thư Viện",
  [ROLES.GIAM_DOC]: "Giám Đốc",
  [ROLES.SINH_VIEN]: "Sinh Viên",
  [ROLES.ADMIN]: "Quản Trị Viên"
});

/**
 * STATUS ENUMS
 */
const STATUS = Object.freeze({
  ACTIVE: 1,
  INACTIVE: 0,
  PENDING: 2,
  DELETED: -1
});

const STATUS_LABELS = Object.freeze({
  [STATUS.ACTIVE]: "Hoạt động",
  [STATUS.INACTIVE]: "Không hoạt động",
  [STATUS.PENDING]: "Chờ xử lý",
  [STATUS.DELETED]: "Đã xóa"
});

/**
 * STUDENT STATUS ENUMS
 */
const STUDENT_STATUS = Object.freeze({
  DANG_HOC: 1,
  BAO_LUU: 2,
  THOI_HOC: 3,
  TOT_NGHIEP: 4,
  CHUYEN_TRUONG: 5
});

const STUDENT_STATUS_LABELS = Object.freeze({
  [STUDENT_STATUS.DANG_HOC]: "Đang học",
  [STUDENT_STATUS.BAO_LUU]: "Bảo lưu",
  [STUDENT_STATUS.THOI_HOC]: "Thôi học",
  [STUDENT_STATUS.TOT_NGHIEP]: "Tốt nghiệp",
  [STUDENT_STATUS.CHUYEN_TRUONG]: "Chuyển trường"
});

/**
 * GRADE TYPE ENUMS
 */
const GRADE_TYPE = Object.freeze({
  CHUYEN_CAN: "chuyen_can",
  DIEM_KIEM_TRA: "diem_kiem_tra",
  DIEM_GK: "diem_gk",
  DIEM_CK: "diem_ck",
  DIEM_TONG_KET: "diem_tong_ket"
});

const GRADE_TYPE_LABELS = Object.freeze({
  [GRADE_TYPE.CHUYEN_CAN]: "Chuyên cần",
  [GRADE_TYPE.DIEM_KIEM_TRA]: "Điểm kiểm tra",
  [GRADE_TYPE.DIEM_GK]: "Điểm giữa kỳ",
  [GRADE_TYPE.DIEM_CK]: "Điểm cuối kỳ",
  [GRADE_TYPE.DIEM_TONG_KET]: "Điểm tổng kết"
});

/**
 * SEMESTER ENUMS
 */
const SEMESTER = Object.freeze({
  HK1: 1,
  HK2: 2,
  HK3: 3 // Học kỳ hè
});

const SEMESTER_LABELS = Object.freeze({
  [SEMESTER.HK1]: "Học kỳ 1",
  [SEMESTER.HK2]: "Học kỳ 2",
  [SEMESTER.HK3]: "Học kỳ hè"
});

/**
 * GENDER ENUMS
 */
const GENDER = Object.freeze({
  NAM: 1,
  NU: 0
});

const GENDER_LABELS = Object.freeze({
  [GENDER.NAM]: "Nam",
  [GENDER.NU]: "Nữ"
});

/**
 * DEPARTMENT TYPE ENUMS (thuoc_khoa)
 */
const DEPARTMENT_TYPE = Object.freeze({
  PHONG_BAN: 0,
  KHOA: 1
});

const DEPARTMENT_TYPE_LABELS = Object.freeze({
  [DEPARTMENT_TYPE.PHONG_BAN]: "phòng ban",
  [DEPARTMENT_TYPE.KHOA]: "khoa"
});

/**
 * ACTIVE STATUS ENUMS (dang_hoc, trang_thai)
 */
const ACTIVE_STATUS = Object.freeze({
  INACTIVE: 0,
  ACTIVE: 1
});

const ACTIVE_STATUS_LABELS = Object.freeze({
  [ACTIVE_STATUS.INACTIVE]: "không hoạt động",
  [ACTIVE_STATUS.ACTIVE]: "hoạt động"
});

const STUDYING_STATUS_LABELS = Object.freeze({
  [ACTIVE_STATUS.INACTIVE]: "không",
  [ACTIVE_STATUS.ACTIVE]: "có"
});

/**
 * UTILITY FUNCTIONS
 */

// Lấy role name từ role id
const getRoleName = (roleId) => {
  return ROLE_NAMES[roleId] || null;
};

// Lấy role label từ role id
const getRoleLabel = (roleId) => {
  return ROLE_LABELS[roleId] || "Không xác định";
};

// Lấy role id từ role name
const getRoleIdByName = (roleName) => {
  return Object.keys(ROLE_NAMES).find(key => ROLE_NAMES[key] === roleName) || null;
};

// Kiểm tra role có tồn tại không
const isValidRole = (roleId) => {
  return Object.values(ROLES).includes(roleId);
};

// Lấy tất cả roles dạng array
const getAllRoles = () => {
  return Object.entries(ROLE_NAMES).map(([id, name]) => ({
    id: parseInt(id),
    name: name,
    label: ROLE_LABELS[id]
  }));
};

// Lấy status label
const getStatusLabel = (statusId) => {
  return STATUS_LABELS[statusId] || "Không xác định";
};

// Lấy student status label
const getStudentStatusLabel = (statusId) => {
  return STUDENT_STATUS_LABELS[statusId] || "Không xác định";
};

// Lấy grade type label
const getGradeTypeLabel = (gradeType) => {
  return GRADE_TYPE_LABELS[gradeType] || "Không xác định";
};

// Lấy semester label
const getSemesterLabel = (semesterId) => {
  return SEMESTER_LABELS[semesterId] || "Không xác định";
};

// Lấy gender label
const getGenderLabel = (genderId) => {
  return GENDER_LABELS[genderId] || "Không xác định";
};

// Lấy department type label
const getDepartmentTypeLabel = (typeId) => {
  return DEPARTMENT_TYPE_LABELS[typeId] || "Không xác định";
};

// Lấy active status label (cho trang_thai)
const getActiveStatusLabel = (statusId) => {
  return ACTIVE_STATUS_LABELS[statusId] || "Không xác định";
};

// Lấy studying status label (cho dang_hoc)
const getStudyingStatusLabel = (statusId) => {
  return STUDYING_STATUS_LABELS[statusId] || "Không xác định";
};

// Format value theo field name - hàm tiện ích cho getDiffData
const formatValueByField = (fieldName, value) => {
  if (value === null || value === undefined) return "";
  
  // Xử lý các trường đặc biệt
  if (fieldName === "role" || fieldName === "Role") {
    return getRoleName(value) || value;
  }
  
  if (fieldName === "trang_thai") {
    return getActiveStatusLabel(value);
  }
  
  if (fieldName === "gioi_tinh") {
    return getGenderLabel(value);
  }
  
  if (fieldName === "dang_hoc") {
    return getStudyingStatusLabel(value);
  }
  
  if (fieldName === "thuoc_khoa") {
    return getDepartmentTypeLabel(value);
  }
  
  return value;
};

/**
 * EXPORTS
 */
module.exports = {
  // Role enums
  ROLES,
  ROLE_NAMES,
  ROLE_LABELS,
  
  // Status enums
  STATUS,
  STATUS_LABELS,
  
  // Student status enums
  STUDENT_STATUS,
  STUDENT_STATUS_LABELS,
  
  // Grade type enums
  GRADE_TYPE,
  GRADE_TYPE_LABELS,
  
  // Semester enums
  SEMESTER,
  SEMESTER_LABELS,
  
  // Gender enums
  GENDER,
  GENDER_LABELS,
  
  // Department type enums
  DEPARTMENT_TYPE,
  DEPARTMENT_TYPE_LABELS,
  
  // Active status enums
  ACTIVE_STATUS,
  ACTIVE_STATUS_LABELS,
  STUDYING_STATUS_LABELS,
  
  // Utility functions
  getRoleName,
  getRoleLabel,
  getRoleIdByName,
  isValidRole,
  getAllRoles,
  getStatusLabel,
  getStudentStatusLabel,
  getGradeTypeLabel,
  getSemesterLabel,
  getGenderLabel,
  getDepartmentTypeLabel,
  getActiveStatusLabel,
  getStudyingStatusLabel,
  formatValueByField
};