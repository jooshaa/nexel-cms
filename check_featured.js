const http = require('http');

http.get('http://localhost:1337/api/products?filters[featured][$eq]=true&populate=*', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Featured Products count:', json.data.length);
      console.log('Featured Products:', json.data.map(p => p.title).join(', '));
    } catch(e) {
      console.error(e);
    }
  });
});
