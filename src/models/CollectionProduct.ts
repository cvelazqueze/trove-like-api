import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface CollectionProductAttributes {
  collectionId: string;
  productId: string;
  addedAt: Date;
}

type CollectionProductCreationAttributes = Optional<CollectionProductAttributes, 'addedAt'>;

export class CollectionProduct extends Model<
  CollectionProductAttributes,
  CollectionProductCreationAttributes
> implements CollectionProductAttributes {
  declare collectionId: string;
  declare productId: string;
  declare addedAt: Date;
}

CollectionProduct.init(
  {
    collectionId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { model: 'collections', key: 'id' },
      onDelete: 'CASCADE',
    },
    productId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { model: 'products', key: 'id' },
      onDelete: 'CASCADE',
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'collection_products',
    timestamps: false,
    indexes: [{ fields: ['product_id'] }],
  },
);
