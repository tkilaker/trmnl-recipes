#!/usr/bin/env node
// Prints the last 14 days of anonymous counters kept by server.mjs.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const file = join(process.env.CACHE_DIR || join(homedir(), 'Library', 'Caches', 'trmnl-frontpages'), 'stats.json');
const stats = JSON.parse(await readFile(file, 'utf8').catch(() => '{}'));
const days = Object.keys(stats).sort().slice(-14);
const names = [...new Set(days.flatMap(day => Object.keys(stats[day])))].sort();
console.log(['dag', ...names].join('\t'));
for (const day of days) console.log([day, ...names.map(name => stats[day][name] || 0)].join('\t'));
