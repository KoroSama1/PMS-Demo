import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';

const port = Number(process.env.PORT || 5500);
await connectDb();
app.listen(port, () => console.log(`PMS API running on http://localhost:${port}`));
