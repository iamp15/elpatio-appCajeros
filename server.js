const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const app = express();
const PORT = process.env.PORT || 3003; // Puerto específico para app de cajeros

// Middleware
app.use(cors());

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

// Función para inyectar variables de configuración en HTML
function injectConfigVariables(htmlContent) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const backendApiUrl = process.env.BACKEND_API_URL || `${backendUrl}/api`;
  const backendWsUrl = process.env.BACKEND_WS_URL || backendUrl;
  
  const configScript = `<script>
    window.API_CONFIG = window.API_CONFIG || {};
    window.API_CONFIG.BASE_URL = "${backendApiUrl}";
    window.BACKEND_URL = "${backendUrl}";
    window.BACKEND_WS_URL = "${backendWsUrl}";
  </script>`;
  
  // Inyectar en el head antes del cierre de </head>
  if (htmlContent.includes('</head>')) {
    htmlContent = htmlContent.replace(
      '</head>',
      `  ${configScript}\n  </head>`
    );
  } else {
    htmlContent = htmlContent.replace(
      /(<script[^>]*>)/i,
      `${configScript}\n    $1`
    );
  }
  
  return htmlContent;
}

// Ruta principal (ANTES de express.static para que se inyecten las variables)
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "index.html");
  let htmlContent = fs.readFileSync(filePath, "utf-8");
  htmlContent = injectConfigVariables(htmlContent);
  res.send(htmlContent);
});

// Middleware estático DESPUÉS de la ruta principal
app.use(express.static(path.join(__dirname)));

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
