import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import { OrderDetail } from "./orderDetail.model";
import { Product } from "./product.model";
import { ProductVariant } from "./productVariant.model";

export class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<OrderDetail["id"]>;
  declare product_id: ForeignKey<Product["id"]>;
  declare product_variant_id: ForeignKey<ProductVariant["id"]>;
  declare quantity: number;
  declare price: number;
  declare mrp: number;

  // --- ASSOCIATIONS ---
  declare product_variant?: NonAttribute<ProductVariant>;

  static initModel(sequelize: any) {
    OrderItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        mrp: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "order_items",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    OrderItem.belongsTo(OrderDetail, {
      foreignKey: "order_id",
      as: "order_detail",
    });

    OrderItem.belongsTo(Product, {
      foreignKey: "product_id",
      as: "product",
      onDelete: "CASCADE",
    });

    OrderItem.belongsTo(ProductVariant, {
      foreignKey: "product_variant_id",
      as: "product_variant",
      onDelete: "CASCADE",
    });
  }
}
