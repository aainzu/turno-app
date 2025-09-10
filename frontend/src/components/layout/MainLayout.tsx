import { component$, Slot } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export const MainLayout = component$(() => {
  const location = useLocation();

  const navigation = [
    { name: 'Hoy', href: '/', icon: '🏠' },
    { name: 'Semana', href: '/semana/', icon: '📅' },
    { name: 'Mes', href: '/mes/', icon: '🗓️' },
  ];

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Mis Turnos</h1>
            </div>

            <nav class="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.url.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    class={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Slot />
      </main>

      {/* Footer */}
      <footer class="hidden md:block bg-white border-t border-gray-200 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="text-center text-sm text-gray-500">
            <p>© 2025 Sistema de Turnos - Desarrollado con Qwik</p>
          </div>
        </div>
      </footer>
      {/* Mobile navigation */}
      <div class="md:hidden  h-16 fixed bottom-0 w-full bg-white">
        <nav class="flex h-full">
          {navigation.map((item) => {
            const isActive = location.url.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                class={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <span class="text-lg mb-1">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
});
