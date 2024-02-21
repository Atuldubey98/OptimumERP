import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AuthContextProvider from "./contexts/AuthContextProvider.jsx";
import OrgContextProvider from "./contexts/OrgContextProvider.jsx";
import "./index.css";
import theme from "./theme.js";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      <AuthContextProvider>
        <OrgContextProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </OrgContextProvider>
      </AuthContextProvider>
    </ChakraProvider>
  </BrowserRouter>
);
