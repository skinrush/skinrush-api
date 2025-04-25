fetch('https://skinrush-api.onrender.com/api/hello', {
  method: 'GET',
  headers: {
    Origin: 'https://www.skinrush.pro'
  }
})
  .then(res => {
    console.log('🧾 Status:', res.status);
    console.log('🌐 CORS Allowed Origin:', res.headers.get('access-control-allow-origin'));
    return res.text();
  })
  .then(body => console.log('📦 Body:', body))
  .catch(err => console.error('❌ Error:', err));
