import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const requirements = join(root, "apps", "api", "requirements.txt");
const candidates = [
  process.env.PYTHON_BIN,
  process.env.PYTHON_PATH,
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Programs", "Python", "Python312", "python.exe") : undefined,
  process.env.USERPROFILE ? join(process.env.USERPROFILE, "AppData", "Local", "Programs", "Python", "Python312", "python.exe") : undefined,
  "python",
  "py",
].filter(Boolean);

let selected = "";

for (const candidate of candidates) {
  const args = candidate === "py" ? ["-3", "--version"] : ["--version"];
  const result = spawnSync(candidate, args, { stdio: "ignore", shell: false });
  if (result.status === 0) {
    selected = candidate;
    break;
  }
}

if (!selected) {
  console.error("No se encontro Python para instalar dependencias.");
  console.error("Instala Python 3.12 o define PYTHON_BIN con la ruta a python.exe.");
  process.exit(1);
}

const pipArgs = selected === "py" ? ["-3", "-m", "pip", "install", "-r", requirements] : ["-m", "pip", "install", "-r", requirements];
const install = spawnSync(selected, pipArgs, { stdio: "inherit", shell: false });
if (install.status === 0) {
  process.exit(0);
}

console.error("No se pudieron instalar las dependencias Python.");
console.error(`Python usado: ${selected}`);
process.exit(1);
