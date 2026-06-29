const Database = require('better-sqlite3');

const db = new Database('wissen.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwort TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wissen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titel TEXT NOT NULL,
    inhalt TEXT NOT NULL,
    kategorie TEXT,
    user_id INTEGER,
    erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;