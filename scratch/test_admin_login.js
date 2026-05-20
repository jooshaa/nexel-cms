async function run() {
  const response = await fetch('http://[::1]:1337/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'joshqinkutmonbekov81@gmail.com',
      password: 'Family-257027'
    })
  });

  const data = await response.json();
  console.log('Login Status:', response.status);
  console.log('Login Response:', data);
}

run().catch(console.error);
