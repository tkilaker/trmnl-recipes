#!/usr/bin/env node
// Prints the last 14 days of anonymous counters kept by the Worker.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const base = process.env.PUBLISH_URL || 'https://trmnl.diane-feedback-relay.workers.dev';
const token = (await readFile(join(homedir(), '.config', 'trmnl-frontpage', 'publish-token'), 'utf8')).trim();
const stats = await (await fetch(`${base}/stats`, { headers: { authorization: `Bearer ${token}` } })).json();
const days = Object.keys(stats).sort().slice(-14);
const names = [...new Set(days.flatMap(day => Object.keys(stats[day])))].sort();
console.log(['dag', ...names].join('\t'));
for (const day of days) console.log([day, ...names.map(name => stats[day][name] || 0)].join('\t'));
