"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Work extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Work.belongsTo(models.User, { as: "author", foreignKey: "authorId" });
      Work.belongsTo(models.Event, { foreignKey: "eventId" });
      Work.belongsToMany(models.User, { as: "reader", through: "User_Work" });
      Work.belongsToMany(models.Tag, {
        foreignKey: "workId",
        through: "Work_Tag",
      });
    }
  }
  Work.init(
    {
      title: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM,
        values: ["novel", "poetry", "essay", "other"],
        allowNull: false,
      },
      open: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      anonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      content: DataTypes.JSON,
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Work",
    }
  );
  return Work;
};
