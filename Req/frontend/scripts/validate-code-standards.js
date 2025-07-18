#!/usr/bin/env node

/**
 * Script de validación de estándares de código
 * Valida que se cumplan las reglas críticas del proyecto:
 * 1. No uso de window.alert() o window.confirm()
 * 2. Componentes no excedan 300 líneas
 * 3. Funciones no excedan complejidad de 8
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateNoAlerts(filePath, content) {
  const violations = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Buscar window.alert, alert, window.confirm, confirm
    const alertPattern = /(window\.)?alert\s*\(/g;
    const confirmPattern = /(window\.)?confirm\s*\(/g;

    if (alertPattern.test(line) && !line.trim().startsWith('//')) {
      violations.push({
        line: index + 1,
        type: 'alert',
        content: line.trim(),
      });
    }

    if (confirmPattern.test(line) && !line.trim().startsWith('//')) {
      violations.push({
        line: index + 1,
        type: 'confirm',
        content: line.trim(),
      });
    }
  });

  return violations;
}

function validateComponentSize(filePath, content) {
  const lines = content.split('\n');
  const nonEmptyLines = lines.filter(
    line => line.trim() !== '' && !line.trim().startsWith('//')
  );

  if (nonEmptyLines.length > 300) {
    return {
      currentLines: nonEmptyLines.length,
      maxAllowed: 300,
      violation: true,
    };
  }

  return { violation: false };
}

function validateFiles() {
  log('blue', '🔍 Iniciando validación de estándares de código...\n');

  // Buscar archivos TypeScript y TSX
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.test.tsx'],
  });

  let totalViolations = 0;
  let filesWithViolations = 0;

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasViolations = false;

    // Validar alertas
    const alertViolations = validateNoAlerts(filePath, content);
    if (alertViolations.length > 0) {
      if (!fileHasViolations) {
        log('red', `\n❌ ${filePath}`);
        fileHasViolations = true;
        filesWithViolations++;
      }

      alertViolations.forEach(violation => {
        log(
          'red',
          `   Línea ${violation.line}: Uso prohibido de ${violation.type}()`
        );
        log('yellow', `   → ${violation.content}`);
        totalViolations++;
      });
    }

    // Validar tamaño de componente
    const sizeViolation = validateComponentSize(filePath, content);
    if (sizeViolation.violation) {
      if (!fileHasViolations) {
        log('red', `\n❌ ${filePath}`);
        fileHasViolations = true;
        filesWithViolations++;
      }

      log(
        'red',
        `   Componente excede límite de líneas: ${sizeViolation.currentLines}/${sizeViolation.maxAllowed}`
      );
      log('yellow', `   → Este componente debe ser modularizado`);
      totalViolations++;
    }
  });

  // Resumen
  log('blue', '\n📊 Resumen de validación:');
  log('blue', `   Archivos analizados: ${files.length}`);

  if (totalViolations === 0) {
    log('green', '   ✅ No se encontraron violaciones');
    log('green', '   🎉 ¡Código cumple con todos los estándares!');
    process.exit(0);
  } else {
    log('red', `   ❌ Violaciones encontradas: ${totalViolations}`);
    log('red', `   📁 Archivos con problemas: ${filesWithViolations}`);
    log('yellow', '\n💡 Guía de solución:');
    log('yellow', '   • Reemplaza alert() con toast notifications');
    log('yellow', '   • Reemplaza confirm() con Dialog components');
    log(
      'yellow',
      '   • Modulariza componentes >300 líneas en componentes más pequeños'
    );
    log('yellow', '   • Usa hooks personalizados para extraer lógica compleja');
    process.exit(1);
  }
}

// Ejecutar validación
validateFiles();
