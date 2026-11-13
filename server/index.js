import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

async function startLocal() {
  const port = process.env.PORT || 5000;
  await connectDB();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

const shouldListen =
  !process.env.VERCEL && process.env.NODE_ENV !== 'test';

if (shouldListen) {
  startLocal().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

export default app;
