import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AuthContextProvider from "./contexts/AuthContextProvider.jsx";
import "./index.css";
import theme from "./theme";
import SettingContextProvider from "./contexts/SettingContextProvider.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      <SettingContextProvider>
        <AuthContextProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </AuthContextProvider>
      </SettingContextProvider>
    </ChakraProvider>
  </BrowserRouter>
);
