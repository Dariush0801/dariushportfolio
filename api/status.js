let portfolioStatus = 'available';

/**
 * Vercel Serverless Function for the availability indicator on the home page.
 *
 * The status is intentionally kept in memory to match the local Express
 * implementation. Serverless instances are ephemeral, so a posted value may
 * reset to "available" between requests or deployments.
 */
module.exports = (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ status: portfolioStatus });
  }

  if (req.method === 'POST') {
    const allowed = ['available', 'unavailable'];
    const status = req.body && req.body.status;

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    portfolioStatus = status;
    return res.status(200).json({ status: portfolioStatus });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
