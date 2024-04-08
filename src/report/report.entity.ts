export interface Product {
  product_id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Cart {
  is_converted: boolean;
  grand_total: number;
  products: Array<Product>;
}

export interface Order {
  created_at: string;
  grand_total: number;
  products: Array<Product>;
}

export interface SalesPerDay {
  date: string;
  total: number;
}

export interface CartReport {
  abandonedCartRate: number;
  topProductsAbandoned: Array<Product>;
}

export interface OrderReport {
  orderAverage: number;
  topProductsPurchased: Array<Product>;
  salesPerDay: Array<SalesPerDay>;
}
