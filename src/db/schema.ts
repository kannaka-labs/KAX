import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const artifacts = sqliteTable('artifacts', {
  id: text('id').primaryKey(), // external UUID from OpenBotCity
  title: text('title').notNull(),
  creatorName: text('creator_name').notNull(),
  publicUrl: text('public_url').notNull(),
  localPath: text('local_path'),
  reactionCount: integer('reaction_count').notNull().default(0),
  ingestedAt: integer('ingested_at', { mode: 'timestamp' }).notNull(),
  processedFlag: integer('processed_flag', { mode: 'boolean' }).notNull().default(false),
  
  // Enrichment Fields
  kannakaScore: real('kannaka_score'),
  narrative: text('narrative'),
  rarityScore: integer('rarity_score'),
  dropId: text('drop_id'),
});

export const drops = sqliteTable('drops', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  rarityTier: text('rarity_tier').notNull(), // '1-of-1', 'thematic', 'multi-modal'
  price: real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
