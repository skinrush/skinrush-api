import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

export const Skin = sequelize.define('Skin', {
  name: { type: DataTypes.STRING, field: 'name' },
  weapon: { type: DataTypes.STRING, field: 'weapon' },
  collection: { type: DataTypes.STRING, field: 'collection' },
  rarity: { type: DataTypes.STRING, field: 'rarity' },
  min_float: { type: DataTypes.FLOAT, field: 'min_float' },
  max_float: { type: DataTypes.FLOAT, field: 'max_float' },
  stattrak: { type: DataTypes.BOOLEAN, field: 'stattrak' },
  souvenir: { type: DataTypes.BOOLEAN, field: 'souvenir' },
  rarityColor: { type: DataTypes.STRING, field: 'rarity_color' },
  description: DataTypes.TEXT,
  tag: DataTypes.STRING,
  origin: DataTypes.STRING,
  paintIndex: DataTypes.INTEGER,
}, {
  tableName: 'skins',
  timestamps: false
});
