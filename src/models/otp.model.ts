import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
  DataTypes,
} from "sequelize";

export class Otp extends Model<
  InferAttributes<Otp>,
  InferCreationAttributes<Otp>
> {
  declare id: CreationOptional<string>;
  declare contact: string;
  declare contact_type: "phone" | "email";
  declare otp_code: string;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    Otp.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        contact: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isValidContact(value: string) {
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              const isPhone = /^\+[1-9]\d{1,14}$/.test(value);
              if (!isEmail && !isPhone) {
                throw new Error(
                  "Must be a valid email or phone number (E.164)"
                );
              }
            },
          },
        },
        contact_type: {
          type: DataTypes.ENUM("phone", "email"),
          allowNull: false,
        },
        otp_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "otps",
        timestamps: true,
        underscored: true,
      }
    );
  }
}
