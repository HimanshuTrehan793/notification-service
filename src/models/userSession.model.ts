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

export class UserSession extends Model<
  InferAttributes<UserSession>,
  InferCreationAttributes<UserSession>
> {
  declare id: CreationOptional<number>;
  declare token: string;
  declare expires_at: Date;
  declare user_id: ForeignKey<User["id"]>;
  declare ip_address: CreationOptional<string | null>;
  declare user_agent: CreationOptional<string | null>;
  declare browser: CreationOptional<string>;
  declare os: CreationOptional<string>;
  declare device_type: CreationOptional<string>;
  declare device_name: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    UserSession.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        token: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        ip_address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        browser: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "unknown",
        },
        os: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "unknown",
        },
        device_type: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "unknown",
        },
        device_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "user_sessions",
        timestamps: true,
        updatedAt: false,
        underscored: true,
      }
    );
  }

  static associate() {
    UserSession.belongsTo(User, {
      foreignKey: "user_id",
    });
  }
}
