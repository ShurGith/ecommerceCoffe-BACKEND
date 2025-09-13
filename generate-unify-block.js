// generate-unify-block.js
// Detecta dependencias duplicadas (React/Radix) y genera overrides/resolutions según el package manager
// ⚡ Ejecutar: node generate-unify-block.js

import { execSync } from "child_process";
import { existsSync } from "fs";

// Paquetes críticos que suelen duplicarse en el build de Strapi Admin
const packagesToCheck = [
  "react",
  "react-dom",
  "@radix-ui/react-context",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-tooltip",
  "@radix-ui/react-popover",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-progress",
  "@radix-ui/react-checkbox",
];

// --- Detectar package manager ---
const isYarn = existsSync("yarn.lock");
const isNpm = existsSync("package-lock.json");
const blockName = isYarn ? "resolutions" : "overrides";
console.log(
  `🔎 Detectando gestor: ${isYarn ? "Yarn" : isNpm ? "NPM" : "Desconocido"}`
);

// --- Función: listar versiones instaladas ---
function getVersions(pkg) {
  try {
    const result = execSync(`npm ls ${pkg} --json`, {
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    });
    const parsed = JSON.parse(result);
    const versions = new Set();

    function traverse(deps) {
      if (!deps) return;
      for (const [name, info] of Object.entries(deps)) {
        if (name === pkg && info.version) {
          versions.add(info.version);
        }
        traverse(info.dependencies);
      }
    }
    traverse(parsed.dependencies);
    return Array.from(versions);
  } catch {
    return [];
  }
}

// --- Función: elegir la versión más alta ---
function pickHighest(versions) {
  if (versions.length === 0) return null;
  return versions.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pb[i] || 0) > (pa[i] || 0)) return 1;
      if ((pb[i] || 0) < (pa[i] || 0)) return -1;
    }
    return 0;
  })[0];
}

// --- MAIN ---
console.log("\n🔎 Escaneando dependencias posibles duplicadas...\n");

const block = {};

for (const pkg of packagesToCheck) {
  const versions = getVersions(pkg);
  if (versions.length > 1) {
    console.log(`⚠️ ${pkg} tiene múltiples versiones: ${versions.join(", ")}`);
  } else if (versions.length === 1) {
    console.log(`✅ ${pkg} único: ${versions[0]}`);
  } else {
    console.log(`🚫 ${pkg} no encontrado`);
    continue;
  }

  const highest = pickHighest(versions);
  if (highest) {
    block[pkg] = highest;
  }
}

console.log(`\n📦 Bloque "${blockName}" sugerido para package.json:\n`);
console.log(JSON.stringify({ [blockName]: block }, null, 2));

console.log(
  `\n👉 Copia este bloque dentro de tu package.json y luego elimina node_modules + lockfile.\n`
);
console.log(
  isYarn
    ? "yarn install  # reinstala dependencias"
    : "npm install   # reinstala dependencias"
);