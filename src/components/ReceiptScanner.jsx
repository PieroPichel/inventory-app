import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { parseReceiptText } from "../utils/receiptLLM";

console.log("LOCAL HF TOKEN:", import.meta.env.VITE_HF_TOKEN);
console.log("SERVER HF_TOKEN:", process.env.HF_TOKEN);


export default function ReceiptScanner({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // store the stream so we can stop it

  const [streaming, setStreaming] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream; // save stream reference
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreaming(false);
    if (onClose) onClose(); // allow parent to hide scanner
  };

  // Capture image from video
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/png");
  };

// Run OCR
const runOCR = async () => {
  const imageData = captureImage();
  setLoading(true);

  const result = await Tesseract.recognize(imageData, "eng", {
    logger: (m) => console.log(m),
  });

  const rawText = result.data.text;
  setOcrText(rawText);

  // Phase 2: Send to LLM
  const parsedItems = await parseReceiptText(rawText);
  console.log("Parsed items:", parsedItems);

  setLoading(false);
};

  return (
    <div style={{ padding: "20px", background: "#111", borderRadius: "8px" }}>
      {/* START CAMERA BUTTON */}
      {!streaming && (
        <button onClick={startCamera} style={btn}>
          Start Camera
        </button>
      )}

      {/* VIDEO FEED */}
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }}
        />
      </div>

      {/* CAPTURE + STOP BUTTONS */}
      {streaming && (
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={runOCR} style={btn}>
            Capture & Extract Text
          </button>

          <button onClick={stopCamera} style={stopBtn}>
            Stop Camera
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {loading && <p>Processing receipt…</p>}

      {ocrText && (
        <div style={resultBox}>
          <h3>Extracted Text</h3>
          <pre>{ocrText}</pre>
        </div>
      )}
    </div>
  );
}

const btn = {
  padding: "10px 15px",
  background: "#333",
  color: "white",
  border: "1px solid #555",
  borderRadius: "6px",
  cursor: "pointer",
};

const stopBtn = {
  padding: "10px 15px",
  background: "#8b0000",
  color: "white",
  border: "1px solid #aa0000",
  borderRadius: "6px",
  cursor: "pointer",
};

const resultBox = {
  background: "#1f1f1f",
  color: "#eee",
  padding: "15px",
  marginTop: "20px",
  borderRadius: "8px",
  whiteSpace: "pre-wrap",
};
