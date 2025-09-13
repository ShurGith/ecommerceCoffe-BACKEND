// generate-resolutions.js
// Autogenera "resolutions" para Yarn
// ⚡ Ejecutar con: node generate-resolutions.js

import { execSync } from "child_process";

// Lista de librerías críticas de Radix/React a unificar
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
  "@radix-ui/react-checkbox"
];

// Recoge todas las versiones de un paquete usando npm ls
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

// Selecciona la versión más alta (semver simple)
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

// MAIN
console.log("🔎 Escaneando dependencias...\n");

const resolutions = {};

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
    resolutions[pkg] = highest;
  }
}

console.log("\n📦 Bloque resolutions sugerido (para package.json):\n");
console.log(JSON.stringify({ resolutions }, null, 2));