const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


require("./config/initDb")();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", require("./routes/auth.routes"));
app.use("/files", require("./routes/files.routes"));

app.listen(3001, "0.0.0.0", () => {

    console.log(
        "Servidor corriendo"
    );
});