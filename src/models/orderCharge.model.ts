import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  ForeignKey,
} from "sequelize";
import { OrderDetail } from "./orderDetail.model";

export class OrderCharge extends Model<
  InferAttributes<OrderCharge>,
  InferCreationAttributes<OrderCharge>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare type: "delivery";
  declare amount: number;

  static initModel(sequelize: Sequelize) {
    OrderCharge.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        order_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM("delivery"),
          allowNull: false,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "order_charges",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    OrderCharge.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });
  }
}
