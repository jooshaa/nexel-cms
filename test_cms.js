const http = require('http');
http.get('http://localhost:1337/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(JSON.parse(data).data.map(p => ({id: p.id, slug: p.slug}))));
});
