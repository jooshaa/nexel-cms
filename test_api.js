const http = require('http');

http.get('http://localhost:1337/api/hero-slides?populate=*', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json.data, null, 2));
    } catch(e) {
      console.error(e);
    }
  });
});
