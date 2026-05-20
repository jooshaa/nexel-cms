const fs = require('fs');
const path = require('path');

// Extract token from .env.local
let token = 'c1de9ff034f52fbb58af76b87576b299d816aedda629e685b4b37b055f54dd6d5a4cd5c699322200d31fde47a91d146124b725d0398736336041f7f02df3e7e37fa6a0de1856caed75165f71de42637b09382cbe2a109d54c6d88c61175bb2cc59dc49ed00ef3202b894da8a1dba65fa765c5c20a06784c0b4a2116c5ad952f8';
try {
  const envPath = path.resolve(__dirname, '../../nexel/.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/CMS_API_TOKEN\s*=\s*(.+)/);
    if (match && match[1]) {
      token = match[1].trim();
    }
  }
} catch (e) {
  console.log('Error reading .env.local, using fallback token:', e.message);
}

async function request(path, method, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const hosts = ['http://127.0.0.1:1337', 'http://[::1]:1337', 'http://localhost:1337'];
  let lastError;

  for (const host of hosts) {
    try {
      const response = await fetch(`${host}${path}`, options);
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { raw: text };
      }
      return { status: response.status, body: data };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError;
}

async function run() {
  console.log('Using Content API Token:', token.substring(0, 15) + '...');

  // 1. Predefined Category Document ID
  const catDocId = 'py1vekgi49odc77bjik50igl';
  console.log(`\nUsing Predefined Category Document ID: ${catDocId}`);

  // 2. Get or Create Navbar Section
  console.log('\nChecking for existing Trimmers Navbar Section...');
  // Check for navbar section under RU locale first
  const navSearch = await request('/api/navbar-sections?filters[slug][$in][0]=trimmerlar&filters[slug][$in][1]=trimmery&locale=ru', 'GET');
  
  let navDocId = null;

  if (navSearch.status === 200 && navSearch.body.data && navSearch.body.data.length > 0) {
    navDocId = navSearch.body.data[0].documentId;
    console.log(`Found existing Navbar Section (documentId: ${navDocId})`);
    
    // Update RU
    await request(`/api/navbar-sections/${navDocId}?locale=ru`, 'PUT', {
      data: {
        title: 'Триммеры',
        slug: 'trimmery',
        active: true,
        order: 4,
        category: catDocId
      }
    });

    // Update UZ
    await request(`/api/navbar-sections/${navDocId}?locale=uz`, 'PUT', {
      data: {
        title: 'Trimmerlar',
        slug: 'trimmerlar',
        active: true,
        order: 4,
        category: catDocId
      }
    });
  } else {
    console.log('Creating Navbar Section in Russian...');
    const navRuRes = await request('/api/navbar-sections?locale=ru', 'POST', {
      data: {
        title: 'Триммеры',
        slug: 'trimmery',
        active: true,
        order: 4,
        category: catDocId
      }
    });
    if (navRuRes.status >= 300) throw new Error(`Navbar Section RU creation failed: ${JSON.stringify(navRuRes.body)}`);
    navDocId = navRuRes.body.data.documentId;
    console.log(`Navbar Section RU created: ${navDocId}`);

    console.log('Creating Navbar Section Uzbek translation...');
    await request(`/api/navbar-sections/${navDocId}?locale=uz`, 'PUT', {
      data: {
        title: 'Trimmerlar',
        slug: 'trimmerlar',
        active: true,
        order: 4,
        category: catDocId
      }
    });
  }

  // 3. Create Mega Menu Groups
  const brands = [
    { name: 'Philips', slug: 'philips' },
    { name: 'Braun', slug: 'braun' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'Panasonic', slug: 'panasonic' },
    { name: 'Wahl', slug: 'wahl' }
  ];

  const brandGroups = {};

  for (const b of brands) {
    console.log(`\nChecking for existing Mega Menu Group for ${b.name}...`);
    // Find in RU locale
    const groupSearch = await request(`/api/mega-menu-groups?filters[slug][$eq]=${b.slug}&filters[category][documentId][$eq]=${catDocId}&locale=ru`, 'GET');
    
    let groupDocId = null;
    let groupIdRu = null;
    let groupIdUz = null;

    if (groupSearch.status === 200 && groupSearch.body.data && groupSearch.body.data.length > 0) {
      groupDocId = groupSearch.body.data[0].documentId;
      console.log(`Found existing Mega Menu Group: ${b.name} (documentId: ${groupDocId})`);
      
      // Update RU
      const updateRu = await request(`/api/mega-menu-groups/${groupDocId}?locale=ru`, 'PUT', {
        data: {
          title: b.name,
          slug: b.slug,
          active: true,
          category: catDocId,
          navbarSection: navDocId
        }
      });
      groupIdRu = updateRu.body.data.id;

      // Update UZ
      const updateUz = await request(`/api/mega-menu-groups/${groupDocId}?locale=uz`, 'PUT', {
        data: {
          title: b.name,
          slug: b.slug,
          active: true,
          category: catDocId,
          navbarSection: navDocId
        }
      });
      groupIdUz = updateUz.body.data.id;
    } else {
      console.log(`Creating Mega Menu Group for ${b.name} in Russian...`);
      const groupRuRes = await request('/api/mega-menu-groups?locale=ru', 'POST', {
        data: {
          title: b.name,
          slug: b.slug,
          active: true,
          order: 1,
          category: catDocId,
          navbarSection: navDocId
        }
      });
      if (groupRuRes.status >= 300) throw new Error(`Group ${b.name} RU creation failed: ${JSON.stringify(groupRuRes.body)}`);
      groupDocId = groupRuRes.body.data.documentId;
      groupIdRu = groupRuRes.body.data.id;
      console.log(`Group ${b.name} RU created: ${groupDocId}`);

      console.log(`Creating Uzbek translation for group ${b.name}...`);
      const groupUzRes = await request(`/api/mega-menu-groups/${groupDocId}?locale=uz`, 'PUT', {
        data: {
          title: b.name,
          slug: b.slug,
          active: true,
          order: 1,
          category: catDocId,
          navbarSection: navDocId
        }
      });
      groupIdUz = groupUzRes.body.data.id;
    }

    brandGroups[b.slug] = {
      docId: groupDocId,
      ruId: groupIdRu,
      uzId: groupIdUz
    };
  }

  // 4. Create Products
  const products = [
    {
      title: { ru: 'Philips Bodygroom 3000', uz: 'Philips Bodygroom 3000' },
      slug: 'philips-bodygroom-3000',
      price: 49,
      brand: 'philips',
      desc: {
        ru: 'Эффективный триммер для тела с бритвенной насадкой для бережного ухода.',
        uz: 'Terini shikastlamasdan tozalovchi samarali tana trimmer.'
      }
    },
    {
      title: { ru: 'Braun Series XT5', uz: 'Braun Series XT5' },
      slug: 'braun-series-xt5',
      price: 69,
      brand: 'braun',
      desc: {
        ru: 'Универсальный триммер и бритва для лица и тела с набором насадок.',
        uz: 'Yuz va tana uchun universal trimmer va ustara to\'plami.'
      }
    },
    {
      title: { ru: 'Xiaomi Grooming Kit Pro', uz: 'Xiaomi Grooming Kit Pro' },
      slug: 'xiaomi-grooming-kit-pro',
      price: 39,
      brand: 'xiaomi',
      desc: {
        ru: 'Многофункциональный премиальный набор для стрижки и ухода за лицом.',
        uz: 'Sinfdagi eng yaxshi ko\'p funksiyali yuz va soch olish to\'plami.'
      }
    },
    {
      title: { ru: 'Panasonic ER-GB80', uz: 'Panasonic ER-GB80' },
      slug: 'panasonic-er-gb80',
      price: 89,
      brand: 'panasonic',
      desc: {
        ru: 'Премиальный высокоточный триммер для волос, бороды и усов.',
        uz: 'Soqol, soch va mo\'ylov uchun professional yuqori aniqlikdagi trimmer.'
      }
    },
    {
      title: { ru: 'Wahl Color Pro', uz: 'Wahl Color Pro' },
      slug: 'wahl-color-pro',
      price: 59,
      brand: 'wahl',
      desc: {
        ru: 'Профессиональная машинка для стрижки с цветными кодированными насадками.',
        uz: 'Rangli kodlangan nasadkalarga ega professional soch olish mashinasi.'
      }
    }
  ];

  const productDocIds = [];

  for (const p of products) {
    console.log(`\nChecking for existing Product: "${p.title.ru}"...`);
    const prodSearch = await request(`/api/products?filters[slug][$eq]=${p.slug}&locale=ru`, 'GET');

    let prodDocId = null;
    let prodIdRu = null;
    let prodIdUz = null;

    if (prodSearch.status === 200 && prodSearch.body.data && prodSearch.body.data.length > 0) {
      prodDocId = prodSearch.body.data[0].documentId;
      console.log(`Found existing Product (documentId: ${prodDocId})`);

      // Update RU
      const updateRu = await request(`/api/products/${prodDocId}?locale=ru`, 'PUT', {
        data: {
          title: p.title.ru,
          slug: p.slug,
          price: p.price,
          shortDescription: p.desc.ru,
          featured: true,
          stock: 50,
          category: catDocId
        }
      });
      prodIdRu = updateRu.body.data.id;

      // Update UZ
      const updateUz = await request(`/api/products/${prodDocId}?locale=uz`, 'PUT', {
        data: {
          title: p.title.uz,
          slug: p.slug,
          price: p.price,
          shortDescription: p.desc.uz,
          featured: true,
          stock: 50,
          category: catDocId
        }
      });
      prodIdUz = updateUz.body.data.id;
    } else {
      console.log(`Creating Product "${p.title.ru}" in Russian...`);
      const prodRuRes = await request('/api/products?locale=ru', 'POST', {
        data: {
          title: p.title.ru,
          slug: p.slug,
          price: p.price,
          shortDescription: p.desc.ru,
          featured: true,
          stock: 50,
          category: catDocId
        }
      });
      if (prodRuRes.status >= 300) throw new Error(`Product ${p.title.ru} RU creation failed: ${JSON.stringify(prodRuRes.body)}`);
      prodDocId = prodRuRes.body.data.documentId;
      prodIdRu = prodRuRes.body.data.id;
      console.log(`Product RU created: ${prodDocId}`);

      console.log(`Creating Uzbek translation for product "${p.title.uz}"...`);
      const prodUzRes = await request(`/api/products/${prodDocId}?locale=uz`, 'PUT', {
        data: {
          title: p.title.uz,
          slug: p.slug,
          price: p.price,
          shortDescription: p.desc.uz,
          featured: true,
          stock: 50,
          category: catDocId
        }
      });
      prodIdUz = prodUzRes.body.data.id;
    }

    productDocIds.push({
      docId: prodDocId,
      ruId: prodIdRu,
      uzId: prodIdUz,
      brand: p.brand,
      titleRu: p.title.ru,
      slug: p.slug
    });
  }

  // 5. Establish relations for products to mega menu groups & navbar section featured products
  console.log('\nLinking products to Mega Menu Groups and Navbar Section...');

  // Group products by brand
  const brandProducts = {};
  for (const p of productDocIds) {
    if (!brandProducts[p.brand]) brandProducts[p.brand] = [];
    brandProducts[p.brand].push(p.docId);
  }

  // Update MegaMenuGroups with their featuredProducts relation (using documentIds)
  for (const brandSlug in brandProducts) {
    const bg = brandGroups[brandSlug];
    const docIds = brandProducts[brandSlug];
    console.log(`Linking group ${brandSlug} (documentId: ${bg.docId}) to products: ${docIds}`);

    const updateRu = await request(`/api/mega-menu-groups/${bg.docId}?locale=ru`, 'PUT', {
      data: {
        featuredProducts: docIds
      }
    });
    if (updateRu.status >= 300) console.error(`Failed to link RU group: ${JSON.stringify(updateRu.body)}`);

    const updateUz = await request(`/api/mega-menu-groups/${bg.docId}?locale=uz`, 'PUT', {
      data: {
        featuredProducts: docIds
      }
    });
    if (updateUz.status >= 300) console.error(`Failed to link UZ group: ${JSON.stringify(updateUz.body)}`);
  }

  // Also link ALL products to the Navbar Section's featuredProducts relation (for both locales)
  const allProductDocIds = productDocIds.map(p => p.docId);
  console.log(`Linking Navbar Section (documentId: ${navDocId}) to all products: ${allProductDocIds}`);

  const navUpdateRu = await request(`/api/navbar-sections/${navDocId}?locale=ru`, 'PUT', {
    data: {
      featuredProducts: allProductDocIds
    }
  });
  if (navUpdateRu.status >= 300) console.error(`Failed to link RU navbar: ${JSON.stringify(navUpdateRu.body)}`);

  const navUpdateUz = await request(`/api/navbar-sections/${navDocId}?locale=uz`, 'PUT', {
    data: {
      featuredProducts: allProductDocIds
    }
  });
  if (navUpdateUz.status >= 300) console.error(`Failed to link UZ navbar: ${JSON.stringify(navUpdateUz.body)}`);


  // 6. Explicit Publish (to be 100% sure they are published and visible)
  console.log('\nPublishing all created documents in both locales...');

  const docsToPublish = [
    { type: 'categories', docId: catDocId },
    { type: 'navbar-sections', docId: navDocId },
    ...brands.map(b => ({ type: 'mega-menu-groups', docId: brandGroups[b.slug].docId })),
    ...productDocIds.map(p => ({ type: 'products', docId: p.docId }))
  ];

  for (const doc of docsToPublish) {
    console.log(`Publishing ${doc.type}/${doc.docId} in Russian...`);
    const pubRu = await request(`/api/${doc.type}/${doc.docId}/actions/publish?locale=ru`, 'POST');
    if (pubRu.status >= 300) console.error(`Failed to publish RU ${doc.type}/${doc.docId}: ${JSON.stringify(pubRu.body)}`);

    console.log(`Publishing ${doc.type}/${doc.docId} in Uzbek...`);
    const pubUz = await request(`/api/${doc.type}/${doc.docId}/actions/publish?locale=uz`, 'POST');
    if (pubUz.status >= 300) console.error(`Failed to publish UZ ${doc.type}/${doc.docId}: ${JSON.stringify(pubUz.body)}`);
  }

  console.log('\n================================================================');
  console.log('IMPORT AND RELATION ESTABLISHMENT COMPLETED SUCCESSFULLY!');
  console.log('----------------------------------------------------------------');
  console.log('Summary of Created/Updated Entries:');
  console.log(`1. Category Document ID: ${catDocId}`);
  console.log(`   - ru slug: trimmery ("Триммеры")`);
  console.log(`   - uz slug: trimmerlar ("Trimmerlar")`);
  console.log(`2. Navbar Section Document ID: ${navDocId}`);
  console.log(`   - ru: Триммеры`);
  console.log(`   - uz: Trimmerlar`);
  console.log('3. Mega Menu Groups:');
  for (const brandSlug in brandGroups) {
    console.log(`   - ${brandSlug.toUpperCase()}: ${brandGroups[brandSlug].docId}`);
  }
  console.log('4. Products:');
  for (const p of productDocIds) {
    console.log(`   - ${p.titleRu} [slug: ${p.slug}] -> Document ID: ${p.docId}`);
  }
  console.log('================================================================');
}

run().catch(console.error);
