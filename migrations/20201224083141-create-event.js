"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Events", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      hostId: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      presentAttendeesLimit: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      openWorksTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Events");
  },
};
