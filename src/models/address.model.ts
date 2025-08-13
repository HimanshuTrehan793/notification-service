import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
  ForeignKey,
} from "sequelize";
import { User } from "./user.model";

export class Address extends Model<
  InferAttributes<Address>,
  InferCreationAttributes<Address>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare phone_number: string;
  declare name: string;
  declare city: string;
  declare pincode: string;
  declare state: string;
  declare address_line1: string;
  declare address_line2: string;
  declare lat: number;
  declare lng: number;
  declare is_default: boolean;
  declare landmark: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    Address.init(
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
        is_default: {
          type: DataTypes.BOOLEAN,
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
        tableName: "addresses",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["phone_number"] }, { fields: ["user_id"] }],
      }
    );
  }

  static associate() {
    Address.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}
