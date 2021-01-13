"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        id: 1,
        username: "v61265",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "v61265@gmail.com",
        nickname: "生菜",
        session: "gs_11",
        contact: "https://google.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "admin",
        record: "",
        description: "毫無反應只是顆生菜",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        username: "zoe_ho",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "zeo@gmail.com",
        nickname: "zoe",
        session: "if_02",
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "admin",
        record: "",
        description:
          "若能夠欣賞到Zoe的美，相信我們一定會對Zoe改觀。問題的關鍵究竟為何？做好Zoe這件事，可以說已經成為了全民運動。",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        username: "Leiiiiiii",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "iiiii@gmail.com",
        nickname: "Lei",
        session: "gs_08",
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "active-member",
        record: "",
        description:
          "話雖如此，威爾科克斯講過，一天之中最美好的時光在黎明。這讓我的思緒清晰了。Leiiiiiii必定會成為未來世界的新標準。",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        username: "chihyu",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "chihyu@gmail.com",
        nickname: "chihyu",
        session: "gs_03",
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "admin",
        record: "",
        description: "探討慈妤時，如果發現非常複雜，那麼想必不簡單。",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        username: "zangwang",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "zangwang@gmail.com",
        nickname: "張妄",
        session: "if_01",
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "active-member",
        record: "",
        description:
          "老舊的想法已經過時了。儘管張妄看似不顯眼，卻佔據了我的腦海。",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        username: "yongchen",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "yongchen@gmail.com",
        nickname: "yongchen",
        session: "gs_04",
        contact: "https://example.com",
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "active-member",
        record: "",
        description: "若無法徹底理解yongchen，恐怕會是人類的一大遺憾。",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        username: "who",
        password:
          "$2b$10$IbVzlvVo56xaiYkBTl2WpesHbQcba5Bjf5wh7lzUG2yH50k6IwO2W",
        email: "who@gmail.com",
        nickname: "誰",
        session: "if_2",
        contact: null,
        portrait: "https://ppt.cc/fni7cx@.jpg",
        role: "frozen",
        record: "",
        description: "還沒被加入的邊緣人",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
