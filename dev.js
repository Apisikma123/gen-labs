#!/usr/bin/env node

/**
 * GEN LABS — Unified Local Development Runner
 * Starts Laravel API backend (port 8000) and Next.js frontend (port 3000)
 * with unified logs, health check, and clean process lifecycle.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = __dirname;
const API_DIR = path.join(ROOT_DIR, 'api');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MUTED = '\x1b[90m';

console.log(`${BOLD}${CYAN}
  ╔════════════════════════════════════════════════════════════╗
  ║                GEN LABS — LOCAL DEV HOST                  ║
  ║         Interactive Virtual Science & STEM Platform        ║
  ╚════════════════════════════════════════════════════════════╝
${RESET}`);

// Preflight checks
const sqlitePath = path.join(API_DIR, 'database', 'database.sqlite');
if (!fs.existsSync(sqlitePath)) {
  console.log(`${YELLOW}[PREFLIGHT] database.sqlite belum ada, membuat file baru...${RESET}`);
  fs.writeFileSync(sqlitePath, '');
}

function killProcess(proc) {
  if (!proc || !proc.pid) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  } else {
    try {
      proc.kill('SIGTERM');
    } catch {}
  }
}

let apiProcess = null;
let webProcess = null;
let shuttingDown = false;

function cleanup() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${YELLOW}[DEV] Menghentikan server backend dan frontend...${RESET}`);
  killProcess(apiProcess);
  killProcess(webProcess);
  console.log(`${GREEN}[DEV] Semua server telah dihentikan bersih.${RESET}\n`);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  killProcess(apiProcess);
  killProcess(webProcess);
});

// Preflight: Node.js version check
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 20) {
  console.log(`${YELLOW}[WARNING] Versi Node.js (${process.version}) di bawah v20. Sangat disarankan Node.js v20 atau v22+ LTS.${RESET}`);
}

function resolvePhpBinary() {
  const isWin = process.platform === 'win32';
  if (!isWin) return 'php';

  // 1. Coba perintah php standar dari PATH
  try {
    execSync('php -v', { stdio: 'ignore' });
    return 'php';
  } catch {}

  // 2. Jika di Windows dengan Laragon, deteksi versi PHP terbaru yang terpasang
  const laragonPhpDir = 'C:\\laragon\\bin\\php';
  if (fs.existsSync(laragonPhpDir)) {
    try {
      const candidates = fs.readdirSync(laragonPhpDir)
        .filter((dir) => dir.startsWith('php-') && fs.existsSync(path.join(laragonPhpDir, dir, 'php.exe')))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
      if (candidates.length > 0) {
        return path.join(laragonPhpDir, candidates[0], 'php.exe');
      }
    } catch {}
  }

  return 'php.exe';
}

// 1. Start Laravel API
console.log(`${CYAN}[API] Memulai Laravel Backend di http://127.0.0.1:8000 ...${RESET}`);
const isWin = process.platform === 'win32';
const phpCmd = resolvePhpBinary();

apiProcess = spawn(phpCmd, ['artisan', 'serve', '--host=127.0.0.1', '--port=8000', '--no-reload'], {
  cwd: API_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: isWin,
});

apiProcess.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (!line) return;
  // Filter noisy server ticks
  if (line.includes('Server running on') || line.includes('Failed to listen') || line.includes('error')) {
    console.log(`${CYAN}[API]${RESET} ${line}`);
  }
});

apiProcess.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`${RED}[API ERR]${RESET} ${line}`);
});

apiProcess.on('error', (err) => {
  console.error(`${RED}[API ERROR] Gagal menjalankan PHP: ${err.message}${RESET}`);
  console.error(`${YELLOW}Pastikan PHP sudah terinstall dan ada di sistem PATH.${RESET}`);
});

// 2. Start Next.js Frontend
console.log(`${GREEN}[WEB] Memulai Next.js Frontend di http://localhost:3000 ...${RESET}\n`);
const npmCmd = isWin ? 'npm.cmd' : 'npm';

webProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: WEB_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: isWin,
});

webProcess.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (!line) return;
  console.log(`${GREEN}[WEB]${RESET} ${line}`);
});

webProcess.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`${YELLOW}[WEB]${RESET} ${line}`);
});

webProcess.on('error', (err) => {
  console.error(`${RED}[WEB ERROR] Gagal menjalankan frontend: ${err.message}${RESET}`);
});

setTimeout(() => {
  console.log(`${BOLD}${GREEN}
  ✔ Local Development Siap!
  ${RESET}
  ${BOLD}Aplikasi Web:${RESET}      ${CYAN}http://localhost:3000${RESET}
  ${BOLD}Halaman Tanya AI:${RESET} ${CYAN}http://localhost:3000/tanya-ai${RESET}
  ${BOLD}Portal Admin:${RESET}      ${CYAN}http://localhost:3000/admin${RESET}
  ${BOLD}API Backend:${RESET}       ${CYAN}http://127.0.0.1:8000/api${RESET}

  ${MUTED}Tekan Ctrl+C untuk menghentikan kedua server secara bersamaan.${RESET}
  `);
}, 3500);
