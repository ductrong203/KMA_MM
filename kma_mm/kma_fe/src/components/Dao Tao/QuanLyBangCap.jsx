import { Box, Button, Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useState } from 'react'
import PrintIcon from '@mui/icons-material/Print';
import PageHeader from '../../layout/PageHeader';
const mockStudents = [
    {
        id: 1,
        code: 'SV001',
        name: 'Nguyễn Văn A',
        class: 'LT01',
        status: 'active',
        credits: 120,
        gpa: 3.2,
        graduationStatus: 'eligible',
        hasDegree: false
    },
    {
        id: 2,
        code: 'SV002',
        name: 'Trần Thị B',
        class: 'LT01',
        status: 'active',
        credits: 115,
        gpa: 3.5,
        graduationStatus: 'eligible',
        hasDegree: true
    }
];
function QuanLyBangCap() {
    const [openAddClass, setOpenAddClass] = useState(false);

    const [loading, setLoading] = useState(false);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [openGraduationCheck, setOpenGraduationCheck] = useState(false);
    const [openDegreeIssue, setOpenDegreeIssue] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12}>

                    <TableContainer component={Paper}>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mã SV</TableCell>
                                    <TableCell>Họ tên</TableCell>
                                    <TableCell>Ngày xét TN</TableCell>
                                    <TableCell>Trạng thái bằng</TableCell>
                                    <TableCell align="right">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mockStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.code}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>20/01/2024</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.hasDegree ? "Đã cấp bằng" : "Chưa cấp bằng"}
                                                color={student.hasDegree ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<PrintIcon />}
                                                onClick={() => { }}
                                                disabled={!student.hasDegree}
                                            >
                                                In xác nhận
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    )
}

export default QuanLyBangCap