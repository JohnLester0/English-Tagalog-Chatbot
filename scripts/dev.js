const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const venvPython = process.platform === "win32"
  ? path.join(root, ".venv", "Scripts", "python.exe")
  : path.join(root, ".venv", "bin", "python");
const port = process.env.PORT || "8000";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
  if (result.error) return { ok: false, error: result.error };
  return { ok: result.status === 0, status: result.status };
}

function runPython(args) {
  const candidates = process.platform === "win32"
    ? [["python", args], ["py", ["-3", ...args]]]
    : [["python3", args], ["python", args]];
  for (const [cmd, cmdArgs] of candidates) {
    const result = run(cmd, cmdArgs);
    if (result.ok) return true;
    if (result.error && result.error.code === "ENOENT") continue;
    // Try the next interpreter if this candidate failed to launch or execute.
  }
  return false;
}

if (!fs.existsSync(venvPython)) {
  console.log("Creating Python virtual environment (.venv)...");
  if (!runPython(["-m", "venv", ".venv"])) {
    console.error("Could not create the virtual environment. Install Python 3 and make sure it is on PATH.");
    process.exit(1);
  }
}

// Ensure project dependencies are installed; this also repairs an incomplete environment.
const check = spawnSync(venvPython, ["-c", "import fastapi, uvicorn, httpx, anthropic"], {
  cwd: root, stdio: "ignore"
});
if (check.status !== 0) {
  console.log("Installing Python requirements (first run may take a few minutes)...");
  const install = spawnSync(venvPython, ["-m", "pip", "install", "-r", "requirements.txt"], {
    cwd: root, stdio: "inherit"
  });
  if (install.status !== 0) {
    console.error("Dependency installation failed. Check the error above and try again.");
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(root, ".env")) && fs.existsSync(path.join(root, ".env.example"))) {
  fs.copyFileSync(path.join(root, ".env.example"), path.join(root, ".env"));
  console.log("Created .env from .env.example. Review its settings if needed.");
}

const args = ["-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", port];
if (process.env.NODE_ENV !== "production") args.push("--reload");

console.log(`Starting Kuwentuhan Bot at http://127.0.0.1:${port}`);
const server = spawn(venvPython, args, { cwd: root, stdio: "inherit" });
server.on("error", (err) => {
  console.error("Could not start the Python server:", err.message);
  process.exit(1);
});
server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    if (!server.killed) server.kill(sig);
  });
}
