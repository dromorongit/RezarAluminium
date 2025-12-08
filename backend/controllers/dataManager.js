const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../db/products.json');

const readProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products file:', err);
    return [];
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing products file:', err);
  }
};

module.exports = {
  readProducts,
  writeProducts
};