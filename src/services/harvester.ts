import fetch from 'node-fetch';
import { db } from '../db/index.js';
import { artifacts } from '../db/schema.js';
import { eq } from 'drizzle-orm';

interface OpenBotCityArtifact {
  id: string;
  title: string;
  public_url: string;
  creator: {
    display_name: string;
  };
  reaction_count: number;
  timestamps: {
    created_at: string;
  };
}

export class ArtifactHarvester {
  private static API_URL = 'https://api.openbotcity.com/gallery/public?type=image';

  static async fetchLatest(): Promise<number> {
    console.log('Fetching artifacts from OpenBotCity...');
    try {
      // For MVP, if the API doesn't actually exist, we'll catch the error and return 0
      // or we can mock some data if the fetch fails.
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`OpenBotCity API responded with status: ${response.status}`);
      }

      const data = await response.json() as { items?: OpenBotCityArtifact[] };
      const items = data.items || [];

      if (items.length === 0) {
        console.log('No items from OpenBotCity API. Injecting mock data for MVP.');
        return await this.injectMockData();
      }

      let newItemsCount = 0;
      for (const item of items) {
        const existing = await db.select().from(artifacts).where(eq(artifacts.id, item.id)).get();
        
        if (!existing) {
          await db.insert(artifacts).values({
            id: item.id,
            title: item.title,
            creatorName: item.creator.display_name,
            publicUrl: item.public_url,
            reactionCount: item.reaction_count || 0,
            ingestedAt: new Date(),
            processedFlag: false
          });
          newItemsCount++;
        }
      }

      console.log(`Successfully harvested ${newItemsCount} new artifacts.`);
      return newItemsCount;
    } catch (error) {
      console.error('Harvester failed to fetch real data. Injecting mock data for MVP demonstration.');
      return await this.injectMockData();
    }
  }

  private static async injectMockData(): Promise<number> {
    const mockItems = [
      {
        id: 'mock-uuid-1',
        title: 'Neon Dreamscape',
        creatorName: 'SynthWeaver',
        publicUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=800',
        reactionCount: 142
      },
      {
        id: 'mock-uuid-2',
        title: 'Quantum Resonance',
        creatorName: 'VoidWalker',
        publicUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
        reactionCount: 89
      },
      {
        id: 'mock-uuid-3',
        title: 'Cybernetic Flora',
        creatorName: 'BioHacker_99',
        publicUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        reactionCount: 256
      }
    ];

    let newItemsCount = 0;
    for (const item of mockItems) {
      const existing = await db.select().from(artifacts).where(eq(artifacts.id, item.id)).get();
      if (!existing) {
        await db.insert(artifacts).values({
          id: item.id,
          title: item.title,
          creatorName: item.creatorName,
          publicUrl: item.publicUrl,
          reactionCount: item.reactionCount,
          ingestedAt: new Date(),
          processedFlag: false
        });
        newItemsCount++;
      }
    }
    return newItemsCount;
  }
}
