#!/usr/bin/env node

import { createTables } from '../src/lib/db/migrations.js';
import { initializeDatabase } from '../src/lib/db/index.js';

async function main() {
  try {
    console.log('🚀 Iniciando migraciones...');

    // Inicializar conexión a la base de datos
    await initializeDatabase();

    // Crear tablas
    await createTables();

    console.log('✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante las migraciones:', error);
    process.exit(1);
  }
}

main();
