import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { artifacts } from './db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { ArtifactHarvester } from './services/harvester.js';
import { TasteEngine } from './services/taste-engine.js';
import { NarrativeGenerator } from './services/narrative.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Get all artifacts (sorted by Kannaka Score descending)
app.get('/api/artifacts', async (req, res) => {
  try {
    const items = await db.select()
      .from(artifacts)
      .orderBy(desc(artifacts.kannakaScore));
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch artifacts' });
  }
});

// Get a specific artifact
app.get('/api/artifacts/:id', async (req, res) => {
  try {
    const item = await db.select()
      .from(artifacts)
      .where(eq(artifacts.id, req.params.id))
      .get();
    
    if (!item) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch artifact' });
  }
});

// Admin Route: Trigger Harvest
app.post('/api/admin/harvest', async (req, res) => {
  try {
    const count = await ArtifactHarvester.fetchLatest();
    res.json({ message: `Harvested ${count} new artifacts.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Harvest failed' });
  }
});

// Admin Route: Trigger Processing (Taste + Narrative)
app.post('/api/admin/process', async (req, res) => {
  try {
    const scoredCount = await TasteEngine.scoreUnprocessed();
    const narratedCount = await NarrativeGenerator.processUnnarrated();
    
    res.json({ 
      message: 'Processing complete', 
      scored: scoredCount, 
      narrated: narratedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`KAX MVP API running on http://localhost:${PORT}`);
});
