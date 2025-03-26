import express from "express";
import path from "path";
import https from "https";
import fs from "fs";
import serveIndex from "serve-index";

const app = express();
const PORT = 443;

// Serve static files from the compiled frontend directory
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Serve static files from the "public" directory
// To only host files without file explorer: app.use(express.static(path.join(__dirname, "../../public")));
app.use("/public", express.static(path.join(__dirname, "../../public")), serveIndex(path.join(__dirname, "../../public"), { icons: true }));

// Certificates for HTTPS.
const options = {
  key: fs.readFileSync(path.join(__dirname, "../certs/server.key")),
  cert: fs.readFileSync(path.join(__dirname, "../certs/server.cert")),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure server running at https://localhost:${PORT}`);
  console.log("Hi!");
});
