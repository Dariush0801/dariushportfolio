// Serverless in-memory active visitor tracking (starts at 0, only real active visitors)
const activeVisitors = new Map();

function cleanupVisitors() {
  const now = Date.now();
  for (const [id, data] of activeVisitors.entries()) {
    if (now - data.lastPing > 12000) {
      activeVisitors.delete(id);
    }
  }
}

module.exports = (req, res) => {
  cleanupVisitors();

  if (req.method === 'GET') {
    const visitors = Array.from(activeVisitors.values());
    return res.status(200).json({
      activeCount: visitors.length,
      visitors: visitors
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (req.url && req.url.includes('/leave')) {
      const vId = body && (body.visitorId || body.id);
      if (vId) {
        activeVisitors.delete(vId);
      }
      cleanupVisitors();
      const visitors = Array.from(activeVisitors.values());
      return res.status(200).json({
        activeCount: visitors.length,
        visitors: visitors
      });
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
    return res.status(200).json({
      activeCount: visitors.length,
      visitors: visitors
    });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
