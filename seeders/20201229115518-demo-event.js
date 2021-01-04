"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Events", [
      {
        id: 1,
        title: "第一場批鬥會",
        description:
          "富爾曼諾夫說過一句經典的名言，一個人就是一種典型。但願各位能從這段話中獲得心靈上的滋長。對第一場批鬥會進行深入研究，在現今時代已經無法避免了。在這種不可避免的衝突下，我們必須解決這個問題。看看別人，再想想自己，會發現問題的核心其實就在你身旁。",
        picture: "https://ppt.cc/fvNpnx@.jpg",
        hostId: 1,
        presentAttendeesLimit: 15,
        time: new Date(),
        openWorksTime: new Date(),
        location: "松山南京小樹屋 201",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "再辦一場批鬥會",
        description:
          "如果此時我們選擇忽略再辦一場批鬥會，那後果可想而知。話雖如此，我們卻也不能夠這麼篤定。/n/n再辦一場批鬥會究竟是怎麼樣的存在，始終是個謎題。",
        picture: "https://ppt.cc/fvNpnx@.jpg",
        hostId: 2,
        presentAttendeesLimit: 10,
        time: new Date(),
        openWorksTime: new Date(),
        location: "生菜家 (?)",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        title: "再辦一場批鬥會",
        description:
          "如果此時我們選擇忽略再辦一場批鬥會，那後果可想而知。話雖如此，我們卻也不能夠這麼篤定。/n/n再辦一場批鬥會究竟是怎麼樣的存在，始終是個謎題。",
        picture: "https://ppt.cc/fvNpnx@.jpg",
        hostId: "2",
        presentAttendeesLimit: 10,
        time: new Date(),
        openWorksTime: new Date(),
        location: "生菜家 (?)",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        title: "集合啦！文化部補助批鬥會！",
        description:
          "10/1~10/31是文化部青年創作補助申請的日子，/n為了想要去無人島寫作的你，/n身經百戰的彩色戰士們組織了一個神秘的補助批鬥會，/n只要在10/18前繳交你的企劃書和試寫稿，/n都可以參加補助批鬥會，並且有彩色戰士隨你問到飽！",
        picture: "https://ppt.cc/fvNpnx@.jpg",
        hostId: 1,
        presentAttendeesLimit: 12,
        time: new Date(),
        openWorksTime: new Date(),
        location: "我家隔壁的咖啡廳",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        title: "只有謎可以到達另一個謎",
        description:
          "每天的寫作就像抽卡，你不知道這一抽下去會出什麼/n但至少可以確定兩件事：/n不抽肯定不會出貨；以及/n沒幾發墊刀就想單抽出貨那也是在做夢/n/n反過來說，抽多了自然會出貨/n而且抽這個還不用課金呢；抽得太好，倒是別人要課金給你/n順帶一提：一篇得獎的文章不等於一張SSR，哪那麼簡單/n好歹也得湊幾張SSR組成牌組才有競爭力吧？",
        picture: "https://ppt.cc/fvNpnx@.jpg",
        hostId: 4,
        presentAttendeesLimit: 20,
        time: new Date(),
        openWorksTime: new Date(),
        location: "楫文社",
        isDeleted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Events", null, {});
  },
};
