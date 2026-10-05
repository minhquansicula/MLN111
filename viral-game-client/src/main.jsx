import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TruthRushApp } from "./truth-rush/TruthRushApp";
import { Volume2, VolumeX } from "lucide-react";

function BackgroundMusic() {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  return (
    <div className="tr-music-player">
      <audio ref={audioRef} src="/sound/bgm.mp3" loop />
      <button 
        className="tr-music-toggle" 
        onClick={() => setPlaying(!playing)}
        title={playing ? "Tắt nhạc" : "Bật nhạc"}
      >
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      {playing && (
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="tr-volume-slider"
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <BackgroundMusic />
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
