import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import { setGlobalLocaleConfig, detectUserLocale } from "./lib/utils/date";

import "./global.css";

// Configurar localización global al inicio de la aplicación
if (typeof window !== 'undefined') {
  // Solo en el navegador, detectar configuración del usuario
  try {
    const userConfig = detectUserLocale();
    setGlobalLocaleConfig(userConfig);
  } catch (error) {
    // Fallback a configuración por defecto si falla la detección
    console.warn('Error detectando configuración del usuario, usando fallback:', error);
    setGlobalLocaleConfig({
      timezone: 'UTC',
      locale: 'en-US',
      weekStartsOn: 1
    });
  }
} else {
  // En el servidor, usar configuración por defecto (se puede personalizar según headers)
  setGlobalLocaleConfig({
    timezone: 'UTC',
    locale: 'en-US',
    weekStartsOn: 1
  });
}

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
