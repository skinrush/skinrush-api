const axios = require('axios');
const Skin = require('./models/Skin');
const sequelize = require('./db');

const CSFILES_URL = 'https://raw.githubusercontent.com/csfloat/cs-files/main/parsed/items.json';

(async () => {
  try {
    console.log('🔃 Connecting to DB...');
    await sequelize.authenticate();
    console.log('✅ Connected to DB');

    const { data } = await axios.get(CSFILES_URL);

    console.log(`📥 Importing ${data.length} skins...`);
    let inserted = 0;

    for (const item of data) {
      const {
        name,
        weapon,
        collection,
        rarity,
        float: { min, max },
        stattrak,
        souvenir,
      } = item;

      await Skin.upsert({
        name,
        weapon,
        collection,
        rarity,
        minFloat: min,
        maxFloat: max,
        stattrak,
        souvenir,
      });

      inserted++;
    }

    console.log(`✅ Imported ${inserted} skins successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message || error);
    process.exit(1);
  }
})();
