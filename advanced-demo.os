#!/usr/bin/env node
// Advanced Omniscript Features Demo via Node
const { DateTime, DateTimeUtils, Database, HTTPServer, Crypto, db } = require('./dist/stdlib/index');

console.log('🎯 Advanced Omniscript Demo via Node');
console.log('-----------------------------------');

// 1. DateTime
const now = DateTime.now();
const future = now.add(1, 'days').add(2, 'hours');
console.log('Now:', now.format('YYYY-MM-DD HH:mm:ss'));
console.log('Future:', future.toISO());

// 2. Duration Utils
const durationStr = DateTimeUtils.formatDuration({years:0, months:0, weeks:0, days:1, hours:1, minutes:30, seconds:15, milliseconds:500});
console.log('Duration:', durationStr);

// 3. Database toSQL stub
class User {}
const q = Database.query(User).where(u=>true).orderBy('id','desc').take(3).toSQL();
console.log('Generated SQL:', q.query);

// 4. HTTPServer stub
const server = new HTTPServer();
server.get('/', (req, res) => res.send('ok'));
server.post('/items', (req, res) => res.json({ok:true}));
console.log('Registered routes:', server['routes'].length);

// 5. Crypto
(async () => {
  const hash = await Crypto.hash('Omni', 'SHA-256');
  console.log('SHA256 hash:', hash);
  const key = await Crypto.generateKey(16);
  console.log('Generated key:', key);
  const uuid = Crypto.generateUUID();
  console.log('UUID:', uuid);
})();

// 6. PackageManager stub
console.log('db.save is', typeof db.save);

console.log('✅ Demo complete');
