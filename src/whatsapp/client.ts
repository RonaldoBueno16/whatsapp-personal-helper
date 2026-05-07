import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { rmSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export let isReady = false;

const AUTH_DATA_PATH = '/app/.wwebjs_auth';

function removeStaleLocks(dir: string): void {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (['SingletonLock', 'SingletonSocket', 'SingletonCookie'].includes(entry)) {
        rmSync(fullPath, { force: true });
        console.log(`Removed stale Chromium lock: ${fullPath}`);
      } else if (statSync(fullPath).isDirectory()) {
        removeStaleLocks(fullPath);
      }
    }
  } catch {
    // directory may not exist yet on first run
  }
}

export const client = new Client({
  authStrategy: new LocalAuth({ dataPath: AUTH_DATA_PATH }),
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
});

export function initWhatsApp(): void {
  client.on('qr', (qr) => {
    console.log('Scan the QR code below to authenticate WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('WhatsApp client ready');

    client.getChats().then((chats) =>                                                                               
      console.log(chats.map((c) => ({ id: c.id._serialized, name: c.name })))                                         
      ); 
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp auth failure:', msg);
    process.exit(1);
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.warn('WhatsApp disconnected:', reason);
  });

  removeStaleLocks(AUTH_DATA_PATH);
  client.initialize().catch((err) => {
    console.error('WhatsApp initialization error:', err);
  });
}
