// netlify/functions/util/db.js
const { NetlifyKV } = require('@netlify/functions');

async function getDatabase() {
  return NetlifyKV();
}

module.exports = {
  getDatabase
};
