import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TruthRushApp } from "./truth-rush/TruthRushApp";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TruthRushApp />
  </BrowserRouter>,
);

document.addEventListener("mousedown", (e) => {
  const ripple = document.createElement("div");
  ripple.className = "tr-click-ripple";
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
});
