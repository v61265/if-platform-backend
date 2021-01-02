"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("User_Events", [
      {
        id: 1,
        eventId: 1,
        userId: 1,
        type: "present",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        eventId: 1,
        userId: 3,
        type: "present",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        eventId: 1,
        userId: 4,
        type: "online",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        eventId: 2,
        userId: 6,
        type: "online",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        eventId: 4,
        userId: 3,
        type: "present",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
