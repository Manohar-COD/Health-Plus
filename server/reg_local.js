const fetch = global.fetch || require('node-fetch');
(async () => {
  const url = 'http://localhost:5000/api/auth/register';
  const payload = { name: 'manu', email: 'Manu@gmail.com', password: '123456' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('status', res.status);
    try { console.log(JSON.parse(text)); } catch (e) { console.log(text); }
  } catch (e) {
    console.error('fetch error', e.message);
  }
})();
