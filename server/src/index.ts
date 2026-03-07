import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { A3Client } from '@a3api/node';

// Load .env from the project root (one level above server/)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());

const apiKey = process.env.A3_API_KEY;
if (!apiKey) {
  console.error('Missing A3_API_KEY — copy .env.example to .env and add your key.');
  process.exit(1);
}

const a3 = new A3Client({ apiKey });

// Passive signals endpoint — hardcodes os_signal and country for the simple flow
app.post('/api/assess-age', async (req, res) => {
  try {
    const result = await a3.assessAge({
      os_signal: 'not-available', // browsers have no OS age signal
      user_country_code: 'US',    // in production, derive from GeoIP or user profile
      ...req.body,
    });

    console.log(`[assess-age] verdict=${result.verdict} bracket=${result.assessed_age_bracket} confidence=${result.confidence_score}`);

    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[assess-age] error:', message);
    res.status(502).json({ message });
  }
});

// Custom endpoint — accepts the full request body including os_signal and country
app.post('/api/assess-age-custom', async (req, res) => {
  try {
    const { os_signal, user_country_code, ...rest } = req.body;

    const result = await a3.assessAge({
      os_signal: os_signal ?? 'not-available',
      user_country_code: user_country_code ?? 'US',
      ...rest,
    });

    console.log(`[assess-age-custom] verdict=${result.verdict} bracket=${result.assessed_age_bracket} confidence=${result.confidence_score}`);

    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[assess-age-custom] error:', message);
    res.status(502).json({ message });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`A3 quickstart server listening on http://localhost:${PORT}`);
});
