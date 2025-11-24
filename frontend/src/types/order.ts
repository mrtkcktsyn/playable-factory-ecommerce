export type OrderUserSummary = {
  id?: string;
  name?: string;
  email?: string;
};

export type OrderItem = {
  product: {
    id?: string;
    name?: string;
    slug?: string;
  } | string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  user?: OrderUserSummary | string;
};
