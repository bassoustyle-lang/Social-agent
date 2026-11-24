import { db } from "./dbConnector";

export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS unclaimed_cases (
      case_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      theme TEXT,
      lore TEXT,
      verified_facts TEXT,
      fictional_additions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS unclaimed_posts (
      post_id TEXT PRIMARY KEY,
      case_id TEXT,
      script TEXT,
      caption TEXT,
      thumbnail_url TEXT,
      reel_url TEXT,
      status TEXT DEFAULT 'draft',
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      reactions INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      video_plays INTEGER DEFAULT 0,
      avg_watch_time REAL DEFAULT 0,
      follower_gain INTEGER DEFAULT 0,
      published_at DATETIME,
      FOREIGN KEY (case_id) REFERENCES unclaimed_cases(case_id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS agent_memory (
      key TEXT PRIMARY KEY,
      value TEXT,
      agent_id TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS unclaimed_sources (
      source_id TEXT PRIMARY KEY,
      case_id TEXT,
      title TEXT,
      author TEXT,
      url TEXT,
      source_type TEXT,
      reliability TEXT,
      claim_supported TEXT,
      accessed_at DATETIME,
      FOREIGN KEY (case_id) REFERENCES unclaimed_cases(case_id)
    );
  `);

  console.log("✅ Database tables initialized successfully.");
}
