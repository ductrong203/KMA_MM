const { initModels } = require("../models/init-models");
const { sequelize } = require("../models");
const { Op } = require("sequelize");
const models = initModels(sequelize);
const { sinh_vien, thoi_khoa_bieu, diem, lop, khoa_dao_tao, danh_muc_dao_tao, mon_hoc, doi_tuong_quan_ly } = models;

const ExcelJS = require("exceljs");

/**
 * Calculate the actual semester within year and academic year from ky_hoc and khoa_dao_tao info.
 */
function calculateSemesterAndYear(kyHoc, khoaNamHoc, soKyHoc1Nam) {
    if (!kyHoc || !khoaNamHoc || !soKyHoc1Nam) {
        return { hocKy: kyHoc || '', namHoc: '' };
    }

    const yearIndex = Math.ceil(kyHoc / soKyHoc1Nam);
    const semesterInYear = ((kyHoc - 1) % soKyHoc1Nam) + 1;

    const namHocParts = khoaNamHoc.split('-');
    if (namHocParts.length !== 2) {
        return { hocKy: kyHoc, namHoc: khoaNamHoc };
    }

    const startYear = parseInt(namHocParts[0]);
    const actualStartYear = startYear + (yearIndex - 1);
    const actualEndYear = actualStartYear + 1;
    const actualNamHoc = `${actualStartYear}-${actualEndYear}`;

    return { hocKy: semesterInYear, namHoc: actualNamHoc };
}

// Color palette for alternating subject headers
const SUBJECT_COLORS = [
    'FFE6F0FF', // Light blue
    'FFFFF3E6', // Light orange
    'FFE6FFE6', // Light green
    'FFFFE6E6', // Light red
    'FFF0E6FF', // Light purple
    'FFE6FFFF', // Light cyan
];

class ExportGradeHocPhanService {
    static async exportToExcel(filters) {
        const { he_dao_tao_id, khoa_dao_tao_id, lop_id, ky_hoc } = filters;

        // Build where clause for thoi_khoa_bieu (only ky_hoc filter)
        const tkbWhere = {};
        if (ky_hoc && ky_hoc !== 'all') tkbWhere.ky_hoc = ky_hoc;

        // Build where clause for sinh_vien (lop_id filter)
        const sinhVienWhere = {};

        // Get valid lop_ids based on khoa or he_dao_tao
        let validLopIds = [];
        if (lop_id) {
            validLopIds = [lop_id];
        } else if (khoa_dao_tao_id) {
            const lops = await lop.findAll({ where: { khoa_dao_tao_id }, attributes: ['id'] });
            validLopIds = lops.map(l => l.id);
        } else if (he_dao_tao_id) {
            const khoas = await khoa_dao_tao.findAll({ where: { he_dao_tao_id }, attributes: ['id'] });
            const khoaIds = khoas.map(k => k.id);
            const lops = await lop.findAll({ where: { khoa_dao_tao_id: khoaIds }, attributes: ['id'] });
            validLopIds = lops.map(l => l.id);
        }

        // Apply lop filter to sinh_vien
        if (validLopIds.length > 0) {
            sinhVienWhere.lop_id = validLopIds;
        }

        // Fetch all diem records with lan_hoc included for retake detection
        const diemRecords = await diem.findAll({
            include: [
                {
                    model: sinh_vien,
                    as: 'sinh_vien',
                    where: sinhVienWhere,
                    required: true,
                    attributes: ['id', 'ma_sinh_vien', 'ho_dem', 'ten', 'ngay_sinh', 'gioi_tinh', 'que_quan', 'doi_tuong_id', 'lop_id'],
                    include: [
                        { model: doi_tuong_quan_ly, as: 'doi_tuong', attributes: ['ma_doi_tuong'] },
                        { model: lop, as: 'lop', attributes: ['id', 'ma_lop', 'khoa_dao_tao_id'] }
                    ]
                },
                {
                    model: thoi_khoa_bieu,
                    as: 'thoi_khoa_bieu',
                    where: Object.keys(tkbWhere).length > 0 ? tkbWhere : undefined,
                    required: true,
                    attributes: ['id', 'lop_id', 'mon_hoc_id', 'ky_hoc'],
                    include: [
                        { model: mon_hoc, as: 'mon_hoc', attributes: ['id', 'ten_mon_hoc'] },
                        {
                            model: lop,
                            as: 'lop',
                            attributes: ['id', 'khoa_dao_tao_id'],
                            include: [
                                { model: khoa_dao_tao, as: 'khoa_dao_tao', attributes: ['id', 'nam_hoc', 'so_ky_hoc', 'so_ky_hoc_1_nam'] }
                            ]
                        }
                    ]
                }
            ],
            // Include lan_hoc for retake detection
            attributes: ['id', 'sinh_vien_id', 'diem_tp1', 'diem_tp2', 'diem_gk', 'diem_ck', 'diem_hp', 'diem_ck2', 'diem_hp_2', 'ghi_chu', 'lan_hoc'],
            order: [[{ model: sinh_vien, as: 'sinh_vien' }, 'ma_sinh_vien', 'ASC']]
        });

        // Collect unique subjects with their ky_hoc, nam_hoc, and lan_hoc
        // Each learning attempt (lan_hoc) for the same subject gets its own column
        const subjectMap = new Map();
        const studentGrades = new Map();

        diemRecords.forEach(record => {
            const sv = record.sinh_vien;
            const tkb = record.thoi_khoa_bieu;
            const khoaInfo = tkb?.lop?.khoa_dao_tao;
            const monHocInfo = tkb?.mon_hoc;

            if (!sv || !monHocInfo) return;

            const { hocKy, namHoc } = calculateSemesterAndYear(
                tkb?.ky_hoc,
                khoaInfo?.nam_hoc,
                khoaInfo?.so_ky_hoc_1_nam
            );

            const lanHoc = record.lan_hoc || 1;
            // Include lan_hoc in subject key so each learning attempt has its own column
            const subjectKey = `${monHocInfo.id}|${tkb.ky_hoc}|${lanHoc}`;
            // Subject name with "(học lại lần X)" suffix for retakes
            const subjectDisplayName = lanHoc > 1
                ? `${monHocInfo.ten_mon_hoc} (học lại lần ${lanHoc})`
                : monHocInfo.ten_mon_hoc;

            // Add to subject map
            if (!subjectMap.has(subjectKey)) {
                subjectMap.set(subjectKey, {
                    monHocId: monHocInfo.id,
                    tenMonHoc: subjectDisplayName,
                    kyHoc: tkb.ky_hoc,
                    hocKy: hocKy,
                    namHoc: namHoc,
                    lanHoc: lanHoc
                });
            }

            // Add student grade data
            if (!studentGrades.has(sv.id)) {
                studentGrades.set(sv.id, {
                    info: {
                        ma_sinh_vien: sv.ma_sinh_vien,
                        ho_ten: `${sv.ho_dem || ''} ${sv.ten || ''}`.trim(),
                        ngay_sinh: sv.ngay_sinh,
                        gioi_tinh: sv.gioi_tinh,
                        que_quan: sv.que_quan,
                        doi_tuong: sv.doi_tuong?.ma_doi_tuong || ''
                    },
                    grades: new Map()
                });
            }

            studentGrades.get(sv.id).grades.set(subjectKey, {
                diem_tp1: record.diem_tp1,
                diem_tp2: record.diem_tp2,
                diem_gk: record.diem_gk,
                diem_ck: record.diem_ck,
                diem_hp: record.diem_hp,
                diem_ck2: record.diem_ck2,
                diem_hp_2: record.diem_hp_2,
                ghi_chu: record.ghi_chu,
                lan_hoc: lanHoc
            });
        });

        // Sort subjects by ky_hoc and ten_mon_hoc
        const sortedSubjects = Array.from(subjectMap.entries())
            .sort((a, b) => {
                if (a[1].kyHoc !== b[1].kyHoc) return a[1].kyHoc - b[1].kyHoc;
                return a[1].tenMonHoc.localeCompare(b[1].tenMonHoc);
            });

        // Check if any record has thi_lai or hp2
        let hasThiLai = false;
        let hasHp2 = false;
        diemRecords.forEach(d => {
            if (d.diem_ck2 !== null && d.diem_ck2 !== undefined) hasThiLai = true;
            if (d.diem_hp_2 !== null && d.diem_hp_2 !== undefined) hasHp2 = true;
        });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Kết quả điểm học phần');

        const staticHeaders = ['Mã HV', 'Tên HV', 'Ngày sinh', 'Giới tính', 'Nơi sinh', 'Đối tượng'];
        const gradeColumnsPerSubject = ['TP1', 'TP2', 'QT', 'KTHP', 'HP'];
        if (hasThiLai) gradeColumnsPerSubject.push('Thi lại');
        if (hasHp2) gradeColumnsPerSubject.push('HP2');
        gradeColumnsPerSubject.push('Ghi chú');

        const numGradeColumns = gradeColumnsPerSubject.length;
        const numStaticCols = staticHeaders.length;

        // Row 1: Static headers + Học kỳ, năm học info
        const headerRow1 = [];
        staticHeaders.forEach(h => headerRow1.push(h));
        sortedSubjects.forEach(([key, subj]) => {
            headerRow1.push(`Học kỳ ${subj.hocKy}, năm học ${subj.namHoc}`);
            for (let i = 1; i < numGradeColumns; i++) headerRow1.push('');
        });
        worksheet.addRow(headerRow1);

        // Row 2: Empty for static + subject names
        const headerRow2 = [];
        staticHeaders.forEach(() => headerRow2.push(''));
        sortedSubjects.forEach(([key, subj]) => {
            headerRow2.push(subj.tenMonHoc);
            for (let i = 1; i < numGradeColumns; i++) headerRow2.push('');
        });
        worksheet.addRow(headerRow2);

        // Row 3: Static headers + grade column names
        const headerRow3 = [];
        staticHeaders.forEach(h => headerRow3.push(h));
        sortedSubjects.forEach(() => {
            gradeColumnsPerSubject.forEach(col => headerRow3.push(col));
        });
        worksheet.addRow(headerRow3);

        // Merge cells for header rows
        for (let i = 0; i < numStaticCols; i++) {
            worksheet.mergeCells(1, i + 1, 3, i + 1);
        }

        let colOffset = numStaticCols + 1;
        sortedSubjects.forEach(() => {
            worksheet.mergeCells(1, colOffset, 1, colOffset + numGradeColumns - 1);
            worksheet.mergeCells(2, colOffset, 2, colOffset + numGradeColumns - 1);
            colOffset += numGradeColumns;
        });

        // Style header rows with colors
        const staticHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } }; // Light green for A-F
        const staticHeaderFont = { bold: true, size: 11 };
        const headerBorder = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Apply styles to rows 1-3
        [1, 2, 3].forEach(rowNum => {
            const row = worksheet.getRow(rowNum);
            row.font = { bold: true };
            row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

            // Static columns (A-F) get green background
            for (let colNum = 1; colNum <= numStaticCols; colNum++) {
                const cell = row.getCell(colNum);
                cell.fill = staticHeaderFill;
                cell.font = staticHeaderFont;
                cell.border = headerBorder;
            }

            // Subject columns get alternating colors
            let subjIndex = 0;
            for (let colNum = numStaticCols + 1; colNum <= row.cellCount; colNum++) {
                const cell = row.getCell(colNum);
                const subjectGroupIndex = Math.floor((colNum - numStaticCols - 1) / numGradeColumns);
                const colorIndex = subjectGroupIndex % SUBJECT_COLORS.length;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUBJECT_COLORS[colorIndex] } };
                cell.border = headerBorder;
            }
        });

        // Add data rows
        const sortedStudents = Array.from(studentGrades.entries())
            .sort((a, b) => a[1].info.ma_sinh_vien.localeCompare(b[1].info.ma_sinh_vien));

        sortedStudents.forEach(([svId, data]) => {
            const rowData = [
                data.info.ma_sinh_vien,
                data.info.ho_ten,
                data.info.ngay_sinh ? new Date(data.info.ngay_sinh).toLocaleDateString('vi-VN') : '',
                data.info.gioi_tinh === 1 ? 'Nam' : (data.info.gioi_tinh === 0 ? 'Nữ' : ''),
                data.info.que_quan || '',
                data.info.doi_tuong || ''
            ];

            sortedSubjects.forEach(([subjectKey, subj]) => {
                const grade = data.grades.get(subjectKey);
                if (grade) {
                    rowData.push(grade.diem_tp1 !== null ? grade.diem_tp1 : '');
                    rowData.push(grade.diem_tp2 !== null ? grade.diem_tp2 : '');
                    rowData.push(grade.diem_gk !== null ? grade.diem_gk : '');
                    rowData.push(grade.diem_ck !== null ? grade.diem_ck : '');
                    rowData.push(grade.diem_hp !== null ? parseFloat(grade.diem_hp).toFixed(1) : '');
                    if (hasThiLai) rowData.push(grade.diem_ck2 !== null ? grade.diem_ck2 : '');
                    if (hasHp2) rowData.push(grade.diem_hp_2 !== null ? parseFloat(grade.diem_hp_2).toFixed(1) : '');
                    // Ghi chú - no suffix needed since subject name now includes retake info
                    rowData.push(grade.ghi_chu || '');
                } else {
                    for (let i = 0; i < numGradeColumns; i++) rowData.push('');
                }
            });

            const newRow = worksheet.addRow(rowData);

            // Apply borders and light background for static columns
            newRow.eachCell((cell, colNumber) => {
                cell.border = headerBorder;
                if (colNumber <= numStaticCols) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8F0' } }; // Very light green
                } else {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        // Auto-fit columns with reasonable widths
        worksheet.columns.forEach((column, index) => {
            if (index < numStaticCols) {
                // Static columns - smaller widths
                const widths = [10, 30, 12, 8, 25, 8]; // Mã HV, Tên HV, Ngày sinh, Giới tính, Nơi sinh, Đối tượng
                column.width = widths[index] || 12;
            } else {
                // Grade columns - compact
                column.width = 6;
            }
        });

        // Make first row height larger for merged cells
        worksheet.getRow(1).height = 20;
        worksheet.getRow(2).height = 25;
        worksheet.getRow(3).height = 20;

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}

module.exports = ExportGradeHocPhanService;
