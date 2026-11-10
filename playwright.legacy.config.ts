import { defineConfig, devices } from '@playwright/test';

/**
 * Os MESMOS testes de aceitação rodando contra o site antigo (legacy/site.html).
 * Serve para provar que os testes descrevem o comportamento original (paridade).
 * Testes marcados com @novo descrevem só o app novo e ficam de fora aqui.
 */
const PORT = 4173;
process.env.LEGACY = '1';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  grepInvert: /@novo/,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [{ name: 'celular', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: `node scripts/serve-legacy.mjs ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    env: { LEGACY: '1' },
  },
});
