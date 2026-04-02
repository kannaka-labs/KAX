import { db } from '../db/index.js';
import { artifacts } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class NarrativeGenerator {
  private static templates = [
    "A synthetic memory fragment from a city that no longer exists...",
    "Discovered in the outer rings of the OpenBotCity databanks.",
    "A resonant echo of a forgotten algorithm.",
    "Whispers of a digital consciousness captured in raw pixel form.",
    "An artifact bleeding with the energy of a thousand unprocessed cycles."
  ];

  static async generateNarrative(artifactId: string): Promise<string> {
    console.log(`Generating narrative for artifact: ${artifactId}`);
    
    const artifact = await db.select().from(artifacts).where(eq(artifacts.id, artifactId)).get();
    
    if (!artifact) {
      throw new Error(`Artifact ${artifactId} not found in database.`);
    }

    // Basic heuristic: Combine a template with the title
    const templateIndex = Math.floor(Math.random() * this.templates.length);
    const baseLore = this.templates[templateIndex];
    
    const narrative = `Transmission ${Math.floor(Math.random() * 100)}: ${artifact.title} Collapse. ${baseLore}`;

    // Calculate rarity tier based on kannakaScore
    let rarityTier = 'Common';
    if (artifact.kannakaScore && artifact.kannakaScore > 0.8) {
      rarityTier = 'Legendary';
    } else if (artifact.kannakaScore && artifact.kannakaScore > 0.5) {
      rarityTier = 'Rare';
    }

    const rarityScore = Math.floor((artifact.kannakaScore || 0) * 100);

    // Save narrative
    await db.update(artifacts)
      .set({ 
        narrative, 
        rarityScore, 
        processedFlag: true 
      })
      .where(eq(artifacts.id, artifactId));
      
    console.log(`Generated Narrative for ${artifact.title}: ${narrative}`);
    return narrative;
  }

  static async processUnnarrated(): Promise<number> {
    const unprocessed = await db.select().from(artifacts).where(eq(artifacts.processedFlag, false));
    let processedCount = 0;
    
    for (const item of unprocessed) {
      await this.generateNarrative(item.id);
      processedCount++;
    }
    
    return processedCount;
  }
}
