(async ()=>{
  const url = 'https://health-plus-production.up.railway.app/api/auth/register';
  const payload = { name: 'CorsCheck', email: 'corscheck+test@example.com', password: 'Test1234' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'https://client-seven-rose.vercel.app' },
      body: JSON.stringify(payload),
    });
    const bodyText = await res.text();
    const headers = {};
    for (const [k,v] of res.headers.entries()) headers[k]=v;
    console.log(JSON.stringify({ status: res.status, headers, body: bodyText }, null, 2));
  } catch (err) {
    console.error('request error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
