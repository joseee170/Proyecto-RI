const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB INIT =================
require("./config/initDb")();

// ================= STATIC FILES (IMPORTANTE) =================
// 🔥 ESTO ES LO QUE TE FALTABA PARA VER IMÁGENES / PDFs / VIDEOS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/auth", require("./routes/auth.routes"));
app.use("/files", require("./routes/files.routes"));

// ================= SERVER =================
app.listen(3001, () => {
    console.log("Servidor corriendo en puerto 3001");
});