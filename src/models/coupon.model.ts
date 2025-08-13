import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { OrderCoupon } from "./orderCoupon.model";

export class Coupon extends Model<
  InferAttributes<Coupon>,
  InferCreationAttributes<Coupon>
> {
  declare id: CreationOptional<string>;
  declare offer_code: string;
  declare description: string;
  declare discount_type: string;
  declare discount_value: number;
  declare min_discount_value: CreationOptional<number | null>;
  declare max_discount_value: CreationOptional<number | null>;
  declare min_order_value: number;
  declare start_date: Date;
  declare end_date: Date;
  declare is_active: boolean;
  declare offer_type: "new_user" | "all_users";
  declare usage_limit_per_user: CreationOptional<number | null>;

  static initModel(sequelize: Sequelize) {
    Coupon.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        offer_code: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        discount_type: {
          type: DataTypes.ENUM("percentage", "fixed"),
          allowNull: false,
        },
        discount_value: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        min_discount_value: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: null,
        },
        max_discount_value: {
          type: DataTypes.FLOAT,
          allowNull: true,
          defaultValue: null,
        },
        min_order_value: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        offer_type: {
          type: DataTypes.ENUM("new_user", "all_users"),
          allowNull: false,
          defaultValue: "all_users",
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        usage_limit_per_user: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "coupons",
        timestamps: true,
        underscored: true,
        paranoid: true,
        indexes: [
          {
            unique: true,
            fields: ["offer_code"],
          },
          {
            fields: ["start_date"],
          },
          {
            fields: ["end_date"],
          },
        ],
      }
    );
  }

  static associate() {
    Coupon.hasMany(OrderCoupon, {
      foreignKey: "coupon_id",
      as: "order_coupons",
      onDelete: "CASCADE",
    });
  }
}
