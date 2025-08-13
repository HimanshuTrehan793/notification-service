import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user.model";
import { OrderItem } from "./orderItem.model";
import { RefundDetail } from "./refundDetail.model";

export class ReturnRequest extends Model<
  InferAttributes<ReturnRequest>,
  InferCreationAttributes<ReturnRequest>
> {
  declare id: CreationOptional<string>;
  declare order_item_id: ForeignKey<OrderItem["id"]>;
  declare user_id: ForeignKey<User["id"]>;
  declare type: "refund" | "replacement";
  declare reason: string;
  declare images: string[];
  declare status:
    | "pending_approval"
    | "approved"
    | "rejected"
    | "shipped"
    | "completed";
  declare admin_comment: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    ReturnRequest.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM("refund", "replacement"),
          allowNull: false,
        },
        reason: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        images: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(
            "pending_approval",
            "approved",
            "rejected",
            "shipped",
            "completed"
          ),
          allowNull: false,
          defaultValue: "pending_approval",
        },
        admin_comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "return_requests",
        underscored: true,
        timestamps: true,
      }
    );
  }

  static associate() {
    ReturnRequest.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
    
    ReturnRequest.belongsTo(OrderItem, {
      foreignKey: "order_item_id",
      as: "order_item",
    });

    ReturnRequest.hasOne(RefundDetail, {
      foreignKey: "return_request_id",
      as: "refund_detail",
    });
  }
}
