const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Skin = sequelize.define('Skin', {
  name: { type: DataTypes.STRING, field: 'name' },
  weapon: { type: DataTypes.STRING, field: 'weapon' },
  collection: { type: DataTypes.STRING, field: 'collection' },
  rarity: { type: DataTypes.STRING, field: 'rarity' },
  minFloat: { type: DataTypes.FLOAT, field: 'minfloat' },
  maxFloat: { type: DataTypes.FLOAT, field: 'maxfloat' },
  stattrak: { type: DataTypes.BOOLEAN, field: 'stattrak' },
  souvenir: { type: DataTypes.BOOLEAN, field: 'souvenir' }
}, {
  tableName: 'Skins',
  timestamps: false
});

module.exports = Skin;
