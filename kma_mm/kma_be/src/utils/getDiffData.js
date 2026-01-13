const { 
  getRoleName,
  getGenderLabel,
  getActiveStatusLabel,
  getStudyingStatusLabel,
  getDepartmentTypeLabel
} = require('../enums/roleEnum');
const { formatDate } = require("../utils/formatDate");

/**
 * So sánh sự khác biệt giữa old data và new data
 * @param {Object} oldData - Dữ liệu cũ
 * @param {Object} newData - Dữ liệu mới
 * @returns {String} - Chuỗi mô tả các thay đổi
 */
const getDiffData = (oldData, newData) => {
  const changes = [];
  
  // Danh sách các field cần bỏ qua
  const ignoredFields = ['create', 'update'];
  
  for (let key in newData) {
    // Bỏ qua các field create/update
    if (ignoredFields.some(field => key.includes(field))) {
      continue;
    }
    
    // Chuẩn hóa null thành chuỗi rỗng
    const oldValue = oldData[key] === null ? "" : oldData[key];
    const newValue = newData[key] === null ? "" : newData[key];
    
    // Chỉ xử lý khi có thay đổi
    if (oldValue !== newValue) {
      const formattedChange = formatChange(key, oldValue, newValue);
      if (formattedChange) {
        changes.push(formattedChange);
      }
    }
  }
  
  return changes.length > 0 ? changes.join(" ; ") : "";
};

/**
 * Format thay đổi theo từng loại field
 * @param {String} fieldName - Tên field
 * @param {*} oldValue - Giá trị cũ
 * @param {*} newValue - Giá trị mới
 * @returns {String} - Chuỗi mô tả thay đổi
 */
const formatChange = (fieldName, oldValue, newValue) => {
  let formattedOld = oldValue;
  let formattedNew = newValue;
  
  // Xử lý field ngày tháng
  if (fieldName.includes("ngay_") || fieldName.includes("ngày ")) {
    formattedOld = formatDate(oldValue);
    formattedNew = formatDate(newValue);
    return `${fieldName}: ${formattedOld} => ${formattedNew}`;
  }
  
  // Xử lý field thuộc khoa (case đặc biệt có format khác)
  if (fieldName.includes("thuoc_khoa" || fieldName.includes("thuộc khoa"))) {
    formattedOld = getDepartmentTypeLabel(oldValue);
    formattedNew = getDepartmentTypeLabel(newValue);
    return `chuyển từ ${formattedOld} => ${formattedNew}`;
  }
  
  // Xử lý field role
  if (fieldName === "role" || fieldName === "Role") {
    formattedOld = getRoleName(oldValue) || oldValue;
    formattedNew = getRoleName(newValue) || newValue;
    return `${fieldName}: ${formattedOld} => ${formattedNew}`;
  }
  
  // Xử lý field trạng thái
  if (fieldName === "trang_thai" || fieldName === "trạng thái") {
    formattedOld = getActiveStatusLabel(oldValue);
    formattedNew = getActiveStatusLabel(newValue);
    return `${fieldName}: ${formattedOld} => ${formattedNew}`;
  }
  
  // Xử lý field giới tính
  if (fieldName === "gioi_tinh" || fieldName === "giới tính") {
    formattedOld = getGenderLabel(oldValue);
    formattedNew = getGenderLabel(newValue);
    return `${fieldName}: ${formattedOld} => ${formattedNew}`;
  }
  
  // Xử lý field đang học
  if (fieldName === "dang_hoc") {
    formattedOld = getStudyingStatusLabel(oldValue);
    formattedNew = getStudyingStatusLabel(newValue);
    return `${fieldName}: ${formattedOld} => ${formattedNew}`;
  }
  
  // Default: trả về format thông thường
  return `${fieldName}: ${formattedOld} => ${formattedNew}`;
};

/**
 * Version nâng cao: trả về array of objects thay vì string
 * Dễ dàng hơn cho việc display hoặc log
 */
const getDiffDataDetailed = (oldData, newData) => {
  const changes = [];
  const ignoredFields = ['create', 'update'];
  
  for (let key in newData) {
    if (ignoredFields.some(field => key.includes(field))) {
      continue;
    }
    
    const oldValue = oldData[key] === null ? "" : oldData[key];
    const newValue = newData[key] === null ? "" : newData[key];
    
    if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue: formatValueByFieldName(key, oldValue),
        newValue: formatValueByFieldName(key, newValue),
        rawOldValue: oldValue,
        rawNewValue: newValue
      });
    }
  }
  
  return changes;
};

/**
 * Helper function để format giá trị theo field name
 */
const formatValueByFieldName = (fieldName, value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  
  if (fieldName.includes("ngay_")) {
    return formatDate(value);
  }
  
  if (fieldName.includes("thuoc_khoa")) {
    return getDepartmentTypeLabel(value);
  }
  
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
  
  return value;
};

module.exports = { 
  getDiffData,
  getDiffDataDetailed,
  formatChange,
  formatValueByFieldName
};
