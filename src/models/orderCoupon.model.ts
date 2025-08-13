import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { OrderDetail } from "./orderDetail.model";
import { User } from "./user.model";
import { Coupon } from "./coupon.model";

export class OrderCoupon extends Model<
  InferAttributes<OrderCoupon>,
  InferCreationAttributes<OrderCoupon>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare user_id: ForeignKey<User["id"]>;
  declare coupon_id: ForeignKey<Coupon["id"]>;
  declare offer_code: string;
  declare discount_type: string;
  declare discount_amount: number;

  static initModel(sequelize: Sequelize) {
    OrderCoupon.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        offer_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        discount_amount: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        discount_type: {
          type: DataTypes.ENUM("percentage", "fixed"),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "order_coupons",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    OrderCoupon.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });

    OrderCoupon.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });

    OrderCoupon.belongsTo(Coupon, {
      foreignKey: "coupon_id",
      as: "coupon",
    });
  }
}
