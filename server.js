const express = require('express');
const path = require('path');

const app = express();
let portfolioStatus = 'available';

// In-memory active visitor tracking (starts at 0, only real active visitors)
const activeVisitors = new Map();

// Helper to cleanup visitors who haven't pinged in > 12s
function cleanupVisitors() {
  const now = Date.now();
  for (const [id, data] of activeVisitors.entries()) {
    if (now - data.lastPing > 12000) {
      activeVisitors.delete(id);
    }
  }
}

app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: ['text/*', 'application/json'] }));

app.get('/api/status', (req, res) => res.json({ status: portfolioStatus }));
app.post('/api/status', (req, res) => {
  const allowed = ['available', 'unavailable'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  portfolioStatus = req.body.status;
  res.json({ status: portfolioStatus });
});

// Real-time visitor list endpoint
app.get('/api/visits', (req, res) => {
  cleanupVisitors();
  const visitors = Array.from(activeVisitors.values());
  res.json({
    activeCount: visitors.length,
    visitors: visitors
  });
});

// Real-time heartbeat endpoint
app.post('/api/visits/heartbeat', (req, res) => {
  cleanupVisitors();
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const vId = body && (body.visitorId || body.id);
  const avatarUrl = body && body.avatarUrl;
  const name = body && body.name;
  if (vId) {
    activeVisitors.set(vId, {
      id: vId,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${vId}`,
      name: name || 'Visitor',
      lastPing: Date.now()
    });
  }
  const visitors = Array.from(activeVisitors.values());
  res.json({
    activeCount: visitors.length,
    visitors: visitors
  });
});

// Real-time disconnect/leave endpoint
app.post('/api/visits/leave', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const vId = body && (body.visitorId || body.id);
  if (vId) {
    activeVisitors.delete(vId);
  }
  cleanupVisitors();
  const visitors = Array.from(activeVisitors.values());
  res.json({
    activeCount: visitors.length,
    visitors: visitors
  });
});

app.use('/Certification', express.static(path.join(__dirname, 'Certification')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/node_modules/ogl', express.static(path.join(__dirname, 'node_modules/ogl')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DDGA portfolio running on http://localhost:${PORT}`));
