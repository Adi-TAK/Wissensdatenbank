const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('wissen.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Datenbank verbunden!');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwort TEXT NOT NULL,
    erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wissen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titel TEXT NOT NULL,
    inhalt TEXT NOT NULL,
    kategorie TEXT,
    user_id INTEGER,
    erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;