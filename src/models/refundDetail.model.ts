import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { PaymentDetail } from "./paymentDetail.model";
import { ReturnRequest } from "./returnRequest.model";

export class RefundDetail extends Model<
  InferAttributes<RefundDetail>,
  InferCreationAttributes<RefundDetail>
> {
  declare id: CreationOptional<string>;
  declare payment_id: ForeignKey<PaymentDetail["id"]>; // Original payment
  declare return_request_id: ForeignKey<ReturnRequest["id"]>; // Kis request ke against hai
  declare razorpay_refund_id: CreationOptional<string | null>;
  declare amount: number;
  declare currency: string;
  declare status: "pending" | "processed" | "failed";

  static initModel(sequelize: Sequelize) {
    RefundDetail.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        razorpay_refund_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "INR",
        },
        status: {
          type: DataTypes.ENUM("pending", "processed", "failed"),
          allowNull: false,
          defaultValue: "pending",
        },
      },
      {
        sequelize,
        tableName: "refund_details",
        underscored: true,
        timestamps: true,
      }
    );
  }

  static associate() {
    RefundDetail.belongsTo(PaymentDetail, {
      foreignKey: "payment_id",
      as: "payment_detail",
    });

    RefundDetail.belongsTo(ReturnRequest, {
        foreignKey: "return_request_id",
        as: "return_request"
    });
  }
}