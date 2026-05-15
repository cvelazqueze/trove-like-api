export interface PriceChangeEvent {
  productId: string;
  name: string;
  previousPrice: number;
  newPrice: number;
  collectionIds: string[];
}

export type PriceChangeNotifier = (event: PriceChangeEvent) => void | Promise<void>;
