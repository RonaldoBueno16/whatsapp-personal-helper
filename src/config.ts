const apiSecret = process.env.API_SECRET;
if (!apiSecret) {
  console.error('API_SECRET env var is required');
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  apiSecret,
};
