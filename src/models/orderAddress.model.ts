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

export class OrderAddress extends Model<
  InferAttributes<OrderAddress>,
  InferCreationAttributes<OrderAddress>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare name: string;
  declare phone_number: string;
  declare city: string;
  declare pincode: string;
  declare state: string;
  declare address_line1: string;
  declare address_line2: string;
  declare lat: number;
  declare lng: number;
  declare landmark: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    OrderAddress.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            is: /^\+[1-9]\d{1,14}$/,
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address_line1: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address_line2: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lat: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        lng: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        landmark: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        pincode: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "order_addresses",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    OrderAddress.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });
  }
}
