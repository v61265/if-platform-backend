"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Events", [
      {
        id: 1,
        title: "第一場批鬥會",
        description:
          "富爾曼諾夫說過一句經典的名言，一個人就是一種典型。但願各位能從這段話中獲得心靈上的滋長。對第一場批鬥會進行深入研究，在現今時代已經無法避免了。在這種不可避免的衝突下，我們必須解決這個問題。看看別人，再想想自己，會發現問題的核心其實就在你身旁。",
        hostId: "1",
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
        hostId: "2",
        presentAttendeesLimit: 10,
        time: new Date(),
        openWorksTime: new Date(),
        location: "生菜家 (?)",
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
