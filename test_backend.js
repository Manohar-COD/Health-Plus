(async ()=>{
  const url = 'https://health-plus-production.up.railway.app/api/ping';
  try {
    console.log('Testing: ' + url);
    const res = await fetch(url, { timeout: 10000 });
    const body = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', body);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
  }
})();
