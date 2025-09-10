import { beforeAll } from 'vitest';

// Configuración global para tests
beforeAll(() => {
  // Configurar timezone para tests
  process.env.TZ = 'America/Argentina/Buenos_Aires';

  // Mock de console methods para reducir ruido en tests
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return; // Ignorar warnings de React
    }
    originalConsoleError(...args);
  };
});
