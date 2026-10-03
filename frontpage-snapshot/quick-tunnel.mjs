#!/usr/bin/env node

import { spawn, execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const execFile = promisify(execFileCallback);
const cloudflared = '/opt/homebrew/bin/cloudflared';
const trmnl = '/Users/tim/.local/bin/trmnl-mcp-call';
const cacheDir = join(homedir(), 'Library', 'Caches', 'trmnl-frontpages');
let activeUrl = '';

async function saveStatus(url) {
  await mkdir(cacheDir, { recursive: true });
  const destination = join(cacheDir, 'tunnel.json');
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify({ url, updatedAt: new Date().toISOString() }, null, 2)}\n`);
  await rename(temporary, destination);
}

async function waitReachable(url) {
  for (let i = 0; i < 30; i++) {
    try { if ((await fetch(`${url}/healthz`, { signal: AbortSignal.timeout(5000) })).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error(`${url} not reachable`);
}

async function updateTrmnl(url) {
  await waitReachable(url);
  const targets = [
    ['dn', '/dn.json?source=frontpage-v1'],
    ['sydsvenskan', '/sydsvenskan.json?source=frontpage-v1']
  ];
  for (const [plugin, path] of targets) {
    const fields = JSON.stringify({ fields: { polling_url: `${url}${path}` } });
    await execFile(trmnl, [plugin, 'IntegrationsWriteSettingsTool', fields], { timeout: 60_000 });
    await execFile(trmnl, [plugin, 'AsyncStartTool', JSON.stringify({
      tool_name: 'IntegrationsRefreshDataTool', arguments: {}
    })], { timeout: 60_000 });
  }
  await saveStatus(url);
  console.log(`TRMNL now polls ${url}`);
}

function connect() {
  const child = spawn(cloudflared, ['tunnel', '--no-autoupdate', '--url', 'http://127.0.0.1:8787'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const inspect = async chunk => {
    const output = chunk.toString();
    console.log(output.trim());
    const url = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i)?.[0];
    if (!url || url === activeUrl) return;
    activeUrl = url;
    try { await updateTrmnl(url); } catch (error) { console.error(`TRMNL update failed: ${error.message}`); }
  };
  child.stdout.on('data', inspect);
  child.stderr.on('data', inspect);
  child.on('exit', code => {
    console.error(`cloudflared exited (${code ?? 'signal'}); launchd will reconnect.`);
    process.exit(code || 1);
  });
}

connect();
