const fs = require('fs');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

let content = fs.readFileSync('../nexel/src/lib/menuData.ts', 'utf8');

content = content.replace(/\{ id: "([^"]+)", name: "([^"]+)"/g, (match, id, name) => {
  return `{ id: "${slugify(name)}", name: "${name}"`;
});

fs.writeFileSync('../nexel/src/lib/menuData.ts', content);
console.log('Fixed menuData.ts slugs');
