(async ()=>{
  const url = 'https://health-plus-production.up.railway.app/api/auth/register';
  const payload = { name: 'Manu', email: 'Manu@gmail.com', password: '123456' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
