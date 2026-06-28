const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./database');
const app = express();

app.use(express.json());
app.use(express.static('.'));
app.use(session({
  secret: 'geheimespasswort123',
  resave: false,
  saveUninitialized: false
}));

// Registrieren
app.post('/api/registrieren', async (req, res) => {
  const { name, email, passwort } = req.body;
  const hash = await bcrypt.hash(passwort, 10);
  db.run(
    'INSERT INTO users (name, email, passwort) VALUES (?, ?, ?)',
    [name, email, hash],
    (err) => {
      if (err) return res.status(400).json({ fehler: 'Email bereits vergeben!' });
      res.json({ erfolg: true });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { email, passwort } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(400).json({ fehler: 'User nicht gefunden!' });
    const ok = await bcrypt.compare(passwort, user.passwort);
    if (!ok) return res.status(400).json({ fehler: 'Falsches Passwort!' });
    req.session.user = { id: user.id, name: user.name, isAdmin: user.isAdmin };
res.json({ erfolg: true, name: user.name, isAdmin: user.isAdmin });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ erfolg: true });
});

// Wer ist eingeloggt?
app.get('/api/ich', (req, res) => {
  if (req.session.user) res.json(req.session.user);
  else res.status(401).json({ fehler: 'Nicht eingeloggt' });
});

// Alle Einträge abrufen (mit Suche)
app.get('/api/wissen', (req, res) => {
  const suche = req.query.suche ? `%${req.query.suche}%` : '%';
  db.all(
    'SELECT * FROM wissen WHERE titel LIKE ? OR inhalt LIKE ? OR kategorie LIKE ? ORDER BY erstellt_am DESC',
    [suche, suche, suche],
    (err, rows) => {
      if (err) return res.status(500).json({ fehler: err.message });
      res.json(rows);
    }
  );
});

// Neuen Eintrag speichern
app.post('/api/wissen', (req, res) => {
  if (!req.session.user) return res.status(401).json({ fehler: 'Bitte einloggen!' });
  const { titel, inhalt, kategorie } = req.body;
  db.run(
    'INSERT INTO wissen (titel, inhalt, kategorie, user_id) VALUES (?, ?, ?, ?)',
    [titel, inhalt, kategorie, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ fehler: err.message });
      res.json({ erfolg: true });
    }
  );
});

// Admin: Alle User sehen
app.get('/api/admin/users', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) 
    return res.status(403).json({ fehler: 'Kein Zugriff!' });
  db.all('SELECT id, name, email, isAdmin, erstellt_am FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ fehler: err.message });
    res.json(rows);
  });
});

// Admin: User löschen
app.delete('/api/admin/users/:id', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin)
    return res.status(403).json({ fehler: 'Kein Zugriff!' });
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ fehler: err.message });
    res.json({ erfolg: true });
  });
});

// Admin: Jeden Eintrag löschen
app.delete('/api/admin/wissen/:id', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin)
    return res.status(403).json({ fehler: 'Kein Zugriff!' });
  db.run('DELETE FROM wissen WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ fehler: err.message });
    res.json({ erfolg: true });
  });
});
// Eigenen Eintrag löschen
app.delete('/api/wissen/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ fehler: 'Bitte einloggen!' });
  db.run(
    'DELETE FROM wissen WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ fehler: err.message });
      res.json({ erfolg: true });
    }
  );
});
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});