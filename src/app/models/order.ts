export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
}

export interface DeliveryMethod {
  id: number;
  shortName: string;
  description: string;
  deliveryTime: string;
  cost: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  pictureUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  buyerEmail: string;
  orderDate: Date;
  status: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  deliveryMethodCost: number;
  items: OrderItem[];
  subTotal: number;
  total: number;
  paymentIntentId?: string;
} 