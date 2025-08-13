import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  ForeignKey,
} from "sequelize";
import { User } from "./user.model";
import { Product } from "./product.model";

export class ProductReview extends Model<
  InferAttributes<ProductReview>,
  InferCreationAttributes<ProductReview>
> {
  declare id: CreationOptional<string>;
  declare user_id: ForeignKey<User["id"]>;
  declare product_id: ForeignKey<Product["id"]>;
  declare rating: number;
  declare description: string;
  declare images: string[];

  static initModel(sequelize: Sequelize) {
    ProductReview.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        images: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
          validate: {
            maxFiveImages(value: string[]) {
              if (value.length > 5) {
                throw new Error("You can upload a maximum of 5 images.");
              }
            },
          },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          validate: {
            min: 1,
            max: 5,
            isOneDecimal(value: number) {
              if (!/^\d(\.\d)?$|^5(\.0)?$/.test(value.toString())) {
                throw new Error(
                  "Rating must have at most 1 decimal place and be between 1 and 5."
                );
              }
            },
          },
        },
      },

      {
        sequelize,
        tableName: "product_reviews",
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    ProductReview.belongsTo(Product, {
      foreignKey: "product_id",
      as: "product",
    });

    ProductReview.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}
