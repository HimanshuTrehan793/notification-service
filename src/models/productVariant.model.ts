import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  ForeignKey,
  Transaction,
} from "sequelize";
import { Product } from "./product.model";
import { Category } from "./category.model";
import { CartItem } from "./cart.model";
import { OrderItem } from "./orderItem.model";

export class ProductVariant extends Model<
  InferAttributes<ProductVariant>,
  InferCreationAttributes<ProductVariant>
> {
  declare id: CreationOptional<string>;
  declare product_id: ForeignKey<Product["id"]>;
  declare name: string;
  declare display_label: string;
  declare description: string;
  declare mrp: number;
  declare price: number;
  declare images: string[];
  declare brand_name: string;
  declare out_of_stock: boolean;
  declare default_variant: boolean;
  declare min_quantity: CreationOptional<number>;
  declare max_quantity: CreationOptional<number>;
  declare total_available_quantity: number;

  declare setCategories: (
    categories: Category[] | null,
    options?: { transaction?: Transaction }
  ) => Promise<void>;

  declare addCategories: (categories: string[] | Category[]) => Promise<void>;
  declare getCategories: () => Promise<Category[]>;

  static initModel(sequelize: Sequelize) {
    ProductVariant.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        product_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        display_label: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        mrp: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        images: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        brand_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        out_of_stock: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        default_variant: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        min_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        max_quantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        total_available_quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "product_variants",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    ProductVariant.belongsTo(Product, {
      foreignKey: "product_id",
      onDelete: "CASCADE",
      as: "product",
    });

    ProductVariant.belongsToMany(Category, {
      through: "product_variant_categories",
      foreignKey: "product_variant_id",
      otherKey: "category_id",
      as: "categories",
      onDelete: "CASCADE",
    });

    ProductVariant.hasMany(CartItem, {
      foreignKey: "product_variant_id",
      as: "cart_items",
      onDelete: "CASCADE",
    });

    ProductVariant.hasMany(OrderItem, {
      foreignKey: "product_variant_id",
      as: "order_items",
    });
  }

  static setupHooks() {
    ProductVariant.afterDestroy(async (instance: ProductVariant) => {
      const count = await ProductVariant.count({
        where: { product_id: instance.product_id },
      });

      if (count === 0) {
        await Product.destroy({ where: { id: instance.product_id } });
      }
    });
  }
}
