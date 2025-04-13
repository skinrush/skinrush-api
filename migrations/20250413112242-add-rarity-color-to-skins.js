module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('skins', 'rarity_color', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('skins', 'rarity_color');
  }
};
