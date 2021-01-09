"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("User_Works", [
      {
        id: 1,
        userId: 2,
        workId: 2,
        isRead: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 4,
        workId: 2,
        isRead: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        userId: 3,
        workId: 1,
        isRead: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        userId: 1,
        workId: 2,
        isRead: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        userId: 6,
        workId: 2,
        isRead: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("User_Works", null, {});
  },
};
