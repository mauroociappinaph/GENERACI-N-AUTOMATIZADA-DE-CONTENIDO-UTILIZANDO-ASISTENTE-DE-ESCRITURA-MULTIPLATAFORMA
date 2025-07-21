import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // URL base de nuestra aplicación
    baseUrl: 'http://localhost:3000',

    // Carpeta donde estarán nuestros tests
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Configuración de viewport (tamaño de pantalla)
    viewportWidth: 1280,
    viewportHeight: 720,

    // Tiempo máximo de espera para comandos
    defaultCommandTimeout: 10000,

    // Configuración de video y screenshots
    video: true,
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // Aquí podemos agregar plugins si necesitamos
    },
  },

  // Configuración para tests de componentes (opcional)
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
