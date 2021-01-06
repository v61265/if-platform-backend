"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Tags", [
      {
        id: 1,
        content: "自然書寫",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        content: "長篇連載",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        content: "林榮三",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        content: "國藝會補助",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        content: "奇幻小說",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Tags", null, {});
  },
};
