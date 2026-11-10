#!/usr/bin/env node
// Hook PostToolUse (Edit|Write): formata com o Prettier do projeto o arquivo que o Claude acabou de editar.
// Nunca bloqueia (sai sempre com 0); erros de formatação aparecem no `npm run check`.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const FORMATTABLE = /\.(ts|tsx|js|mjs|cjs|jsx|json|css|md)$/i;

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const file = input?.tool_input?.file_path;
    const root = process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd();
    if (!file || !FORMATTABLE.test(file)) return;
    const rel = path.relative(root, file);
    if (
      rel.startsWith('..') ||
      /^(legacy|node_modules|\.next)[\\/]/.test(rel) ||
      rel === 'AGENTS.md'
    )
      return;
    const prettier = path.join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    if (!existsSync(prettier)) return;
    spawnSync(process.execPath, [prettier, '--write', '--log-level', 'warn', file], {
      cwd: root,
      stdio: 'ignore',
    });
  } catch {
    /* nunca atrapalha o fluxo */
  }
});
