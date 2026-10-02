import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GameProvider } from "./GameContext";
import App from "./App";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GameProvider>
      <App />
    </GameProvider>
  </BrowserRouter>,
);
