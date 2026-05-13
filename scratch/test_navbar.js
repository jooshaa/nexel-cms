const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
const CMS_TOKEN = process.env.CMS_API_TOKEN;

async function testNavbar() {
  const path = '/navbar-sections';
  const url = new URL(`${CMS_URL}/api${path}`);
  
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(CMS_TOKEN ? { Authorization: `Bearer ${CMS_TOKEN}` } : {}),
      }
    });

    const data = await res.json();
    console.log('Total items:', data.data.length);
    data.data.forEach(item => {
      console.log(`Title: ${item.title}, PublishedAt: ${item.publishedAt}, Active: ${item.active}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

testNavbar();
