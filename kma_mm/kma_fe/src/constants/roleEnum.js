/**
 * ROLE DEFINITIONS
 * 1: training (Phòng đào tạo)
 * 2: examination (Khảo thí)
 * 3: student_manage (QLSV)
 * 4: library (Thư viện)
 * 5: director (Giám đốc)
 * 6: sv (Sinh viên)
 * 7: admin (Quản trị viên)
 * 8: lanhDaoDuyet (Lãnh đạo duyệt)
 */

export const ROLES = {
    TRAINING: 1,
    EXAMINATION: 2,
    STUDENT_MANAGE: 3,
    LIBRARY: 4,
    DIRECTOR: 5,
    STUDENT: 6,
    ADMIN: 7,
    LEADER_APPROVE: 8
};

export const ROLE_MAPPING = {
    1: "training",
    2: "examination",
    3: "student_manage",
    4: "library",
    5: "director",
    6: "sv",
    7: "admin",
    8: "lanhDaoDuyet",
};

export const ROLE_LABELS = {
    1: "Phòng đào tạo",
    2: "Phòng khảo thí",
    3: "Quản lý sinh viên",
    4: "Thư viện",
    5: "Ban giám đốc",
    6: "Sinh viên",
    7: "Quản trị viên",
    8: "Lãnh đạo duyệt",
};

export const ROLE_TITLE_MAPPING = {
    "training": "ĐÀO TẠO",
    "examination": "KHẢO THÍ",
    "student_manage": "QL SINH VIÊN",
    "library": "THƯ VIỆN",
    "director": "BAN GIÁM ĐỐC",
    "sv": "SINH VIÊN",
    "admin": "QUẢN TRỊ VIÊN",
    "lanhDaoDuyet": "LÃNH ĐẠO DUYỆT",
};

/**
 * UTILITY FUNCTIONS
 */
export const getRoleName = (roleId) => ROLE_MAPPING[roleId] || "guest";
export const getRoleLabel = (roleId) => ROLE_LABELS[roleId] || "Khách";
export const getRoleTitle = (roleName) => ROLE_TITLE_MAPPING[roleName] || roleName.toUpperCase();
