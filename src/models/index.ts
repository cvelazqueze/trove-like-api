import { Collection } from './Collection';
import { CollectionProduct } from './CollectionProduct';
import { Product } from './Product';
import { User } from './User';

User.hasMany(Collection, { foreignKey: 'userId', as: 'collections' });
Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Collection.belongsToMany(Product, {
  through: CollectionProduct,
  foreignKey: 'collectionId',
  otherKey: 'productId',
  as: 'products',
});

Product.belongsToMany(Collection, {
  through: CollectionProduct,
  foreignKey: 'productId',
  otherKey: 'collectionId',
  as: 'collections',
});

CollectionProduct.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
CollectionProduct.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { User, Collection, Product, CollectionProduct };
