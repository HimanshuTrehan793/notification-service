import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
} from "sequelize";
import { ProductVariant } from "./productVariant.model";

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare image: string;
  declare priority: number;
  declare parent_id: CreationOptional<string | null>;

  static initModel(sequelize: Sequelize) {
    Category.init(
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
        priority: {
          type: DataTypes.DECIMAL(20, 10),
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        parent_id: {
          type: DataTypes.UUID,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "categories",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Category.belongsTo(Category, {
      foreignKey: "parent_id",
      as: "parent",
    });

    Category.hasMany(Category, {
      foreignKey: "parent_id",
      as: "children",
      onDelete: "CASCADE",
    });

    Category.belongsToMany(ProductVariant, {
      through: "product_variant_categories",
      foreignKey: "category_id",
      otherKey: "product_variant_id",
      as: "variants",
      onDelete: "CASCADE",
    });
  }
}
