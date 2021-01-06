"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("EmailTimes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      eventCreated: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventUpdated: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventRemain: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventSignUp: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventAlternate: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      postSuccess: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      postComment: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("EmailTimes");
  },
};
