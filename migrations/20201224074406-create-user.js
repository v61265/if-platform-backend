"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      nickname: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      session: {
        type: Sequelize.STRING(32),
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      portrait: {
        type: Sequelize.STRING,
        defaultValue: "https://ppt.cc/fni7cx@.jpg",
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM,
        values: ["admin", "active-member", "frozen"],
        defaultValue: "frozen",
        allowNull: false,
      },
      record: Sequelize.TEXT,
      description: Sequelize.TEXT,
      emailTime: {
        type: Sequelize.JSON,
        defaultValue: '{ time: ["all"] }',
        allowNull: false,
      },
      isDelete: {
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
    await queryInterface.dropTable("Users");
  },
};
