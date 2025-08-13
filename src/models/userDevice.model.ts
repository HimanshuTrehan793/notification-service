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

export class UserDevice extends Model<
  InferAttributes<UserDevice>,
  InferCreationAttributes<UserDevice>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare device_token: string;
  declare device_type: "android" | "ios" | "web";
  declare is_active: CreationOptional<boolean>;

  static initModel(sequelize: Sequelize) {
    UserDevice.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        device_token: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
        },
        device_type: {
          type: DataTypes.ENUM("android", "ios", "web"),
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: "user_devices",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    UserDevice.belongsTo(User, {
      foreignKey: "user_id",
    });
  }
}
