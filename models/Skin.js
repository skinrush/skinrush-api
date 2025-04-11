const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const skin = sequelize.define('skin', {
  name: DataTypes.STRING,
  weapon: DataTypes.STRING,
  collection: DataTypes.STRING,
  rarity: DataTypes.STRING,
  minFloat: DataTypes.FLOAT,
  maxFloat: DataTypes.FLOAT,
  stattrak: DataTypes.BOOLEAN,
  souvenir: DataTypes.BOOLEAN,
});

module.exports = skin;
