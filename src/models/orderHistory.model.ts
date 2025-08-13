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

export class OrderHistory extends Model<
  InferAttributes<OrderHistory>,
  InferCreationAttributes<OrderHistory>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare status:
    | "pending"
    | "accepted"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "rejected"
    | "refunded"
    | "returned";
  declare comment: CreationOptional<string | null>;
  declare updated_by: "user" | "admin" | "system";
  declare updated_by_id: CreationOptional<ForeignKey<User["id"]> | null>;

  static initModel(sequelize: Sequelize) {
    OrderHistory.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        status: {
          type: DataTypes.ENUM(
            "pending",
            "accepted",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "rejected",
            "returned",
            "refunded"
          ),
          allowNull: false,
        },
        comment: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        updated_by: {
          type: DataTypes.ENUM("user", "admin", "system"),
          allowNull: false,
          defaultValue: "system",
        },
        updated_by_id: {
          type: DataTypes.UUID,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "order_histories",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    OrderHistory.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });
  }
}
