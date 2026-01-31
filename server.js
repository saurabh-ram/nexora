import http from "http";
import app from "./app.js";
import { appConfig } from "./config/configuration.js";

const server = http.createServer(app);
const PORT = appConfig.port;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
