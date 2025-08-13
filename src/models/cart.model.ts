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
import { ProductVariant } from "./productVariant.model";

export class CartItem extends Model<
  InferAttributes<CartItem>,
  InferCreationAttributes<CartItem>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare product_variant_id: ForeignKey<ProductVariant["id"]>;
  declare quantity: number;

  static initModel(sequelize: Sequelize) {
    CartItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        tableName: "cart_items",
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "product_variant_id"],
          },
          {
            fields: ["user_id"],
          }
        ],
      }
    );
  }

  static associate() {
    CartItem.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });

    CartItem.belongsTo(ProductVariant, {
      foreignKey: "product_variant_id",
      as: "variant",
    });
  }
}
