import * as esbuild from 'esbuild';
import { readdirSync, copyFileSync } from 'node:fs';

const watch = process.argv.includes('--watch');

const entryPoints = [
  ...readdirSync('app/components')
    .filter(f => f.endsWith('.ts'))
    .map(f => `app/components/${f}`),
  'app/services/config.ts',
];

const config = {
  entryPoints,
  bundle: true,
  format: 'esm',
  outbase: 'app',
  outdir: 'app/public',
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  copyFileSync('node_modules/htmx.org/dist/htmx.js', 'app/public/htmx.js');
  await esbuild.build(config);
}
