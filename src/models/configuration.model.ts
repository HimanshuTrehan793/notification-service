// models/product.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";
import { AdBanner } from "./adBanner.model";

export class Configuration extends Model<
  InferAttributes<Configuration>,
  InferCreationAttributes<Configuration>
> {
  declare id: CreationOptional<number>;
  declare phone_number: string;
  declare whatsapp_number: string;
  declare store_status: boolean;
  declare min_order_amount: number;
  declare delivery_charge: number;
  declare delivery_time: number;
  declare delivery_radius: number;
  declare announcement_text?: string;
  declare is_cod_eligible: CreationOptional<boolean>;
  static initModel(sequelize: Sequelize) {
    Configuration.init(
      {
        id: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
          primaryKey: true,
          allowNull: false,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        whatsapp_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        store_status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_cod_eligible: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        min_order_amount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        delivery_charge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        delivery_radius: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        delivery_time: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        announcement_text: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "configurations",
        timestamps: true,
        underscored: true,
      }
    );
  }
  static associate() {
    Configuration.hasMany(AdBanner, {
      foreignKey: "configuration_id",
      as: "ad_banners",
    });
  }
}
