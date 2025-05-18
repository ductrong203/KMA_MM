import { Autocomplete, Box, Button, Card, CardContent, FormControl, Grid, Paper, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

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

function DieuKienTotNghiep() {
    const [activeStep, setActiveStep] = useState(0);
     const [openAddClass, setOpenAddClass] = useState(false);
    
        const [loading, setLoading] = useState(false);
        const [openAddStudent, setOpenAddStudent] = useState(false);
        const [openGraduationCheck, setOpenGraduationCheck] = useState(false);
        const [openDegreeIssue, setOpenDegreeIssue] = useState(false);
        const [selectedStudent, setSelectedStudent] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const graduationSteps = ['Kiểm tra điều kiện', 'Xét duyệt', 'Hoàn thành'];

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };
    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Xét điều kiện tốt nghiệp
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 4 }}>
                            {graduationSteps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Box sx={{ mt: 2 }}>
                            {activeStep === 0 && (
                                <Box>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <Autocomplete
                                            options={mockStudents}
                                            getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Chọn sinh viên" />
                                            )}
                                            onChange={(event, newValue) => setSelectedStudent(newValue)}
                                        />
                                    </FormControl>

                                    {selectedStudent && (
                                        <Card sx={{ mt: 2 }}>
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography color="textSecondary">Số tín chỉ tích lũy</Typography>
                                                        <Typography variant="h6">
                                                            {selectedStudent.credits}/130
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography color="textSecondary">GPA</Typography>
                                                        <Typography variant="h6">
                                                            {selectedStudent.gpa}/4.0
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                {activeStep > 0 && (
                                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                                        Quay lại
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={!selectedStudent}
                                >
                                    {activeStep === graduationSteps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Điều kiện tốt nghiệp
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                • Tích lũy đủ 130 tín chỉ
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • GPA tổng ≥ 2.0
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                • Hoàn thành các môn bắt buộc
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default DieuKienTotNghiep