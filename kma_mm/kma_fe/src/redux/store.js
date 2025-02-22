import { configureStore, createSlice } from "@reduxjs/toolkit";

// Khởi tạo slice để quản lý danh sách sinh viên
const studentSlice = createSlice({
    name: "students",
    initialState: { list: [] }, // Danh sách sinh viên ban đầu rỗng
    reducers: {
        addStudent: (state, action) => {
            state.list.push(action.payload); // Thêm sinh viên mới
        },
        removeStudent: (state, action) => {
            state.list = state.list.filter((student) => student.id !== action.payload);
        },
        updateStudent: (state, action) => {
            const index = state.list.findIndex((s) => s.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload; // Cập nhật thông tin sinh viên
            }
        }
    }
});

// Xuất các action để sử dụng trong component
export const { addStudent, removeStudent, updateStudent } = studentSlice.actions;

// Tạo store với Redux DevTools
export const store = configureStore({
    reducer: { students: studentSlice.reducer },
    devTools: process.env.NODE_ENV !== "production", // Bật Redux DevTools trong môi trường phát triển
});
