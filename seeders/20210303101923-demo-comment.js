"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Comments", [
      {
        id: 1,
        reviewerId: 2,
        workId: 1,
        content:
          "對於一般人來說，評論究竟象徵著什麼呢？這樣看來，我們需要淘汰舊有的觀念，在這種不可避免的衝突下，我們必須解決這個問題。回過神才發現，思考評論的存在意義，已讓我廢寢忘食。我們都知道，只要有意義，那麼就必須慎重考慮。我們不妨可以這樣來想: 透過逆向歸納，得以用最佳的策略去分析評論。若能夠欣賞到評論的美，相信我們一定會對評論改觀。蘇軾曾經說過，水枕能令山俯仰，風船解與月徘徊。請諸位將這段話在心中默念三遍。",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        reviewerId: 3,
        workId: 1,
        content:
          "我們都很清楚，這是個嚴謹的議題。\n我們不得不面對一個非常尷尬的事實，那就是，這必定是個前衛大膽的想法。我們普遍認為，若能理解透徹核心原理，對其就有了一定的了解程度。我們一般認為，抓住了問題的關鍵，其他一切則會迎刃而解。深入的探討咒術，是釐清一切的關鍵。",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Comments", null, {});
  },
};
