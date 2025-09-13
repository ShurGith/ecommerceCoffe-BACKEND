// check-duplicates.js
// Detecta dependencias duplicadas en node_modules

import { execSync } from "child_process";

// Paquetes que queremos vigilar (puedes ampliarlo)
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

function checkPackage(pkg) {
  console.log(`\n🔎 Revisando ${pkg} ...\n`);

  try {
    // Ejecuta npm ls para listar todas las instancias de ese paquete
    const result = execSync(`npm ls ${pkg}`, {
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    });

    console.log(result);
  } catch (err) {
    // npm ls retorna exit code != 0 si hay duplicados → capturamos salida igualmente
    console.log(err.stdout?.toString() || "Error al ejecutar npm ls");
  }
}

console.log(`🚀 Iniciando chequeo de dependencias duplicadas...\n`);

packagesToCheck.forEach(checkPackage);

console.log(
  "\n✅ Completado. Si ves múltiples versiones de un paquete → debes forzar una sola versión con 'overrides' en package.json."
);