const GH_OWNER = 'morehidalgg0';
const GH_REPO = 'EMBICIATE';

function normalizePath(path) {
  return String(path || '')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function copyQuery(reqUrl, keys) {
  const out = new URLSearchParams();
  keys.forEach((key) => {
    const value = reqUrl.searchParams.get(key);
    if (value) out.set(key, value);
  });
  return out.toString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (!['GET', 'PUT'].includes(req.method)) {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const token = String(req.headers.authorization || '').trim();
  if (!token) {
    res.status(401).json({ message: 'Falta Token de GitHub' });
    return;
  }

  const reqUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const path = normalizePath(reqUrl.searchParams.get('path'));
  if (!path) {
    res.status(400).json({ message: 'Falta path' });
    return;
  }

  const qs = copyQuery(reqUrl, ['ref', 't']);
  const githubUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}${qs ? `?${qs}` : ''}`;

  try {
    const ghRes = await fetch(githubUrl, {
      method: req.method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: token,
        'Content-Type': 'application/json',
        'User-Agent': 'embiciate-admin'
      },
      body: req.method === 'PUT' ? JSON.stringify(req.body || {}) : undefined
    });

    const text = await ghRes.text();
    res.status(ghRes.status);
    res.setHeader('Content-Type', ghRes.headers.get('content-type') || 'application/json');
    res.send(text || '{}');
  } catch (err) {
    res.status(502).json({
      message: 'Vercel no pudo conectar con GitHub',
      detail: err && err.message ? err.message : String(err)
    });
  }
}
