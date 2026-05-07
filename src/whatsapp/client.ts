import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export let isReady = false;

export const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '/app/.wwebjs_auth' }),
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

  client.initialize().catch((err) => {
    console.error('WhatsApp initialization error:', err);
  });
}
