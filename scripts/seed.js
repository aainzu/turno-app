#!/usr/bin/env node

import { createTables, seedDatabase } from '../src/lib/db/migrations.js';
import { initializeDatabase, createIndices } from '../src/lib/db/index.js';

async function main() {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Inicializar conexión a la base de datos
    await initializeDatabase();

    // Crear tablas si no existen
    await createTables();

    // Crear índices después de las tablas
    await createIndices();

    // Poblar datos de ejemplo
    await seedDatabase();

    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

main();
