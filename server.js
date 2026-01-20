const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3003; // Puerto específico para app de cajeros

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Configurar headers para Telegram Web Apps
app.use((req, res, next) => {
  // Permitir que la app se abra en iframe de Telegram
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");

  // Headers adicionales para Telegram Web Apps
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta de salud
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Portal de Cajeros server is running",
  });
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🏦 Portal de Cajeros ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Aplicación: http://localhost:${PORT}`);
  console.log(`💚 Salud del servidor: http://localhost:${PORT}/health`);
});
