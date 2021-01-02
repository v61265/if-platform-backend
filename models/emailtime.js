"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EmailTime.hasOne(models.User, { foreignKey: "id" });
    }
  }
  EmailTime.init(
    {
      userId: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      eventCreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventUpdated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventRemain: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventSignUp: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      eventAlternate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      postSuccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      postComment: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "EmailTime",
    }
  );
  return EmailTime;
};
