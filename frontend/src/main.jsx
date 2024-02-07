import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AuthContextProvider from "./contexts/AuthContextProvider.jsx";
import OrgContextProvider from "./contexts/OrgContextProvider.jsx";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChakraProvider>
      <AuthContextProvider>
        <OrgContextProvider>
          <App />
        </OrgContextProvider>
      </AuthContextProvider>
    </ChakraProvider>
  </BrowserRouter>
);
