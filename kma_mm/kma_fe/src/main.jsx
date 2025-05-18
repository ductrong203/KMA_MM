import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@fontsource/roboto"; // Import Roboto font
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import { ToastContainer, toast } from 'react-toastify';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
