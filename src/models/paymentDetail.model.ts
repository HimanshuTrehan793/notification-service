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

export class PaymentDetail extends Model<
  InferAttributes<PaymentDetail>,
  InferCreationAttributes<PaymentDetail>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare razorpay_payment_id: CreationOptional<string | null>;
  declare razorpay_order_id: CreationOptional<string | null>;
  declare razorpay_signature: CreationOptional<string | null>;
  declare status:
    | "created"
    | "captured"
    | "failed"
    | "refunded"
    | "pending"
    | "paid";
  declare amount: number;
  declare currency: string;
  declare method: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    PaymentDetail.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        razorpay_payment_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
          defaultValue: null,
        },
        razorpay_order_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
          defaultValue: null,
        },
        razorpay_signature: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        status: {
          type: DataTypes.ENUM(
            "created",
            "captured",
            "failed",
            "refunded",
            "pending",
            "paid"
          ),
          allowNull: false,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING(5),
          allowNull: false,
          defaultValue: "INR",
        },
        method: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "payment_details",
        underscored: true,
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate() {
    PaymentDetail.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });
  }
}
