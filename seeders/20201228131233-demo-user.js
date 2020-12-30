"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        id: 1,
        username: "v61265",
        password: 123,
        email: "v61265@gmail.com",
        nickname: "生菜",
        session: 11,
        contact: "https://google.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "admin",
        record: "",
        description: "毫無反應只是顆生菜",
        emailTime: "all",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        username: "zoe_ho",
        password: 123,
        email: "zeo@gmail.com",
        nickname: "zoe",
        session: 8,
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "admin",
        record: "",
        description:
          "若能夠欣賞到Zoe的美，相信我們一定會對Zoe改觀。問題的關鍵究竟為何？做好Zoe這件事，可以說已經成為了全民運動。",
        emailTime: "all",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        username: "Leiiiiiii",
        password: 123,
        email: "iiiii@gmail.com",
        nickname: "Lei",
        session: 8,
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "active-member",
        record: "",
        description:
          "話雖如此，威爾科克斯講過，一天之中最美好的時光在黎明。這讓我的思緒清晰了。Leiiiiiii必定會成為未來世界的新標準。",
        emailTime: "all",
        isDeleted: 0,
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
