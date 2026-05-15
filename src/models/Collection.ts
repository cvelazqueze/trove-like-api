import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';
import type { Product } from './Product';

export interface CollectionAttributes {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

type CollectionCreationAttributes = Optional<CollectionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Collection extends Model<CollectionAttributes, CollectionCreationAttributes>
  implements CollectionAttributes
{
  declare id: string;
  declare name: string;
  declare userId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare products?: Product[];
}

Collection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'collections',
    indexes: [{ fields: ['user_id'] }],
  },
);
