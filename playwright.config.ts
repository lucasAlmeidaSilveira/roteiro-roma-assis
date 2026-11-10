import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de aceitação (tests/e2e) contra o app novo, em build de produção.
 * As fases ainda não implementadas ficam puladas: veja tests/fases.json.
 */
const PORT = 3100;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'celular', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      // Modo de teste da aba Intenções: lê tests/fixtures/intencoes.json (nunca usar na Vercel)
      INTENCOES_FIXTURE: '1',
    },
  },
});
