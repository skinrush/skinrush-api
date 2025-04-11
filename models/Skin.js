const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Skin = sequelize.define('Skin', {
  id: { type: DataTypes.STRING, field: 'id' },
  name: { type: DataTypes.STRING, field: 'name' },
  weapon: { type: DataTypes.STRING, field: 'weapon' },
  collection: { type: DataTypes.STRING, field: 'collection' },
  rarity: { type: DataTypes.STRING, field: 'rarity' },
  min_float: { type: DataTypes.FLOAT, field: 'min_float' },
  max_float: { type: DataTypes.FLOAT, field: 'max_float' },
  stattrak: { type: DataTypes.BOOLEAN, field: 'stattrak' },
  souvenir: { type: DataTypes.BOOLEAN, field: 'souvenir' }
}, {
  tableName: 'skins',
  timestamps: false
});

module.exports = Skin;
