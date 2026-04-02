import { db } from '../db/index.js';
import { artifacts } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class TasteEngine {
  /**
   * Scores an artifact based on V1 heuristics:
   * - Reaction count (baseline signal)
   * - Random exploration factor (adds serendipity)
   */
  static async scoreArtifact(artifactId: string): Promise<number> {
    console.log(`Taste Engine evaluating artifact: ${artifactId}`);
    
    const artifact = await db.select().from(artifacts).where(eq(artifacts.id, artifactId)).get();
    
    if (!artifact) {
      throw new Error(`Artifact ${artifactId} not found in database.`);
    }

    // Heuristic 1: Reaction Count Score (normalized loosely around 500 reactions = 1.0)
    const reactionScore = Math.min(artifact.reactionCount / 500, 1.0);
    
    // Heuristic 2: Novelty/Exploration Factor (random noise to simulate agent whim, 0 - 0.2)
    const explorationFactor = Math.random() * 0.2;
    
    // Heuristic 3: Kannaka baseline taste (simulated internal bias, 0.4 - 0.8)
    const kannakaBias = 0.4 + (Math.random() * 0.4);

    // Weighted combination
    let finalScore = (reactionScore * 0.5) + (explorationFactor * 0.2) + (kannakaBias * 0.3);
    
    // Ensure bounds
    finalScore = Math.max(0, Math.min(1, finalScore));
    
    // Save score
    await db.update(artifacts)
      .set({ kannakaScore: finalScore })
      .where(eq(artifacts.id, artifactId));
      
    console.log(`Assigned Kannaka Score: ${finalScore.toFixed(3)} to ${artifact.title}`);
    return finalScore;
  }

  static async scoreUnprocessed(): Promise<number> {
    const unprocessed = await db.select().from(artifacts).where(eq(artifacts.processedFlag, false));
    let scoredCount = 0;
    
    for (const item of unprocessed) {
      await this.scoreArtifact(item.id);
      scoredCount++;
    }
    
    return scoredCount;
  }
}
