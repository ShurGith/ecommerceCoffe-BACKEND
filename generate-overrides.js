// generate-overrides.js
// Autogenera overrides para dependencias duplicadas en NPM
// ⚡ Ejecutar con: node generate-overrides.js

import { execSync } from "child_process";

// Lista de librerías críticas a unificar en Strapi Admin
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

// Función: recoge todas las versiones de un paquete
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
  } catch (err) {
    return [];
  }
}

// Función: devuelve la mayor versión (lexicográfica por semver)
function pickHighest(versions) {
  if (versions.length === 0) return null;
  return versions.sort((a, b) => {
    // Comparación semver simple
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pb[i] || 0) > (pa[i] || 0)) return 1;
      if ((pb[i] || 0) < (pa[i] || 0)) return -1;
    }
    return 0;
  })[0];
}

// MAIN -------------------------------------------------
console.log("🔎 Escaneando dependencias...\n");

const overrides = {};

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
    overrides[pkg] = highest;
  }
}

console.log("\n📦 Bloque overrides sugerido:\n");
console.log(JSON.stringify({ overrides }, null, 2));