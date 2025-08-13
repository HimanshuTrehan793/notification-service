// models/product.model.ts
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";
import { ProductVariant } from "./productVariant.model";
import { OrderItem } from "./orderItem.model";
import { ProductReview } from "./productReview.model";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<string>;

  static initModel(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "products",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Product.hasMany(ProductVariant, {
      foreignKey: "product_id",
      as: "product_variants",
      onDelete: "CASCADE",
    });

    Product.hasMany(OrderItem, {
      foreignKey: "product_id",
      as: "order_items",
    });

    Product.hasMany(ProductReview, {
      foreignKey: "product_id",
      as: "product_reviews",
      onDelete: "CASCADE",
    });
  }
}
