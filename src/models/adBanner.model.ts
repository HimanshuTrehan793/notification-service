// models/product.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";
import { Configuration } from "./configuration.model";

export class AdBanner extends Model<
  InferAttributes<AdBanner>,
  InferCreationAttributes<AdBanner>
> {
  declare id: CreationOptional<number>;
  declare image: string;
  declare type: CreationOptional<
    "home" | "category" | "mobileHome" | "mobileCategory"
  >;
  declare action: string;
  declare configuration_id: number;

  static initModel(sequelize: Sequelize) {
    AdBanner.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM(
            "home",
            "category",
            "mobileHome",
            "mobileCategory"
          ),
          allowNull: false,
          defaultValue: "home",
        },
        action: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        configuration_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "configurations",
            key: "id",
          },
          onDelete: "CASCADE",
        },
      },
      {
        sequelize,
        tableName: "ad_banners",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    AdBanner.belongsTo(Configuration, {
      foreignKey: "configuration_id",
      as: "configurations",
    });
  }
}
