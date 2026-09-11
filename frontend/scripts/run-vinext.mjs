import { spawn } from "node:child_process";
import { join } from "node:path";

const [, , command = "dev", ...args] = process.argv;
const vinextCliPath = join(process.cwd(), "node_modules", "vinext", "dist", "cli.js");

const child = spawn(process.execPath, [vinextCliPath, command, ...args], {
  env: {
    ...process.env,
    WRANGLER_LOG_PATH:
      process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
