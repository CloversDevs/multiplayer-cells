import express from "express";
import path from "path";
import serveIndex from "serve-index";

const app = express();
const PORT = 3000;

// Serve static files from the compiled frontend directory
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Serve static files from the "public" directory
// To only host files without file explorer: app.use(express.static(path.join(__dirname, "../../public")));
app.use("/public", express.static(path.join(__dirname, "../../public")), serveIndex(path.join(__dirname, "../../public"), { icons: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  console.log("Hi!");
});
