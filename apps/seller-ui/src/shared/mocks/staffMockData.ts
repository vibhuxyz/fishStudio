// MOCK DATA — swap with real axiosInstance calls once backend is live

export const MOCK_STAFF_LIST = [
  {
    id: "staff_mock_001",
    name: "Arjun Mehta",
    email: "arjun@fishstudio.in",
    isActive: true,
    createdAt: new Date("2025-01-15").toISOString(),
  },
  {
    id: "staff_mock_002",
    name: "Priya Sharma",
    email: "priya.sharma@fishstudio.in",
    isActive: true,
    createdAt: new Date("2025-02-03").toISOString(),
  },
  {
    id: "staff_mock_003",
    name: "Ravi Kumar",
    email: "ravi.kumar@fishstudio.in",
    isActive: false,
    createdAt: new Date("2025-03-10").toISOString(),
  },
];

export const MOCK_STAFF = {
  id: "staff_mock_001",
  name: "Arjun Mehta",
  email: "arjun@fishstudio.in",
  role: "staff" as const,
  isActive: true,
  sellerId: "seller_mock_001",
  seller: {
    id: "seller_mock_001",
    store: {
      name: "FishStudio",
    },
  },
};

export type OrderStatus = "New" | "Processing" | "Ready" | "Completed" | "Rejected";

export interface MockOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  rejectionReason: string | null;
  refundStatus: string | null;
  user: { id: string; name: string; email: string; phone: string; avatar: null };
  shippingAddress: { name: string; street: string; city: string; zip: string; state: string };
  items: {
    productId: string;
    quantity: number;
    price: number;
    unit: string;
    selectedOptions: Record<string, string>;
    product: { title: string; images: { url: string }[] };
  }[];
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ord_mock_000001",
    status: "New",
    total: 1299,
    createdAt: new Date("2024-03-12T10:00:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u1", name: "Suresh Nair", email: "suresh@gmail.com", phone: "+91 98765 43210", avatar: null },
    shippingAddress: { name: "Suresh Nair", street: "12, MG Road", city: "Kochi", zip: "682001", state: "Kerala" },
    items: [
      {
        productId: "p1",
        quantity: 2,
        price: 450,
        unit: "kg",
        selectedOptions: { cut: "Full Clean" },
        product: {
          title: "Karimeen (Pearl Spot Fish)",
          images: [{ url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=200" }],
        },
      },
      {
        productId: "p2",
        quantity: 1,
        price: 399,
        unit: "kg",
        selectedOptions: { cut: "Curry Cut" },
        product: {
          title: "Rohu Fish",
          images: [{ url: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000002",
    status: "New",
    total: 2850,
    createdAt: new Date("2024-03-12T11:20:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u2", name: "Kavitha Reddy", email: "kavitha.r@gmail.com", phone: "+91 87654 32109", avatar: null },
    shippingAddress: { name: "Kavitha Reddy", street: "47, Jubilee Hills", city: "Hyderabad", zip: "500033", state: "Telangana" },
    items: [
      {
        productId: "p3",
        quantity: 3,
        price: 650,
        unit: "kg",
        selectedOptions: { cut: "Fillet" },
        product: {
          title: "Surmai (King Mackerel)",
          images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200" }],
        },
      },
      {
        productId: "p4",
        quantity: 1,
        price: 850,
        unit: "500g",
        selectedOptions: {},
        product: {
          title: "Tiger Prawns",
          images: [{ url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000003",
    status: "Processing",
    total: 1750,
    createdAt: new Date("2024-03-12T08:45:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u3", name: "Ramesh Iyer", email: "ramesh.iyer@yahoo.com", phone: "+91 77654 12345", avatar: null },
    shippingAddress: { name: "Ramesh Iyer", street: "3, T Nagar", city: "Chennai", zip: "600017", state: "Tamil Nadu" },
    items: [
      {
        productId: "p5",
        quantity: 2,
        price: 550,
        unit: "kg",
        selectedOptions: { cut: "Full" },
        product: {
          title: "Vanjaram (Seer Fish)",
          images: [{ url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200" }],
        },
      },
      {
        productId: "p6",
        quantity: 1,
        price: 650,
        unit: "kg",
        selectedOptions: { size: "Large" },
        product: {
          title: "Lobster",
          images: [{ url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000004",
    status: "Ready",
    total: 899,
    createdAt: new Date("2024-03-11T15:30:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u4", name: "Ananya Singh", email: "ananya.s@gmail.com", phone: "+91 90123 45678", avatar: null },
    shippingAddress: { name: "Ananya Singh", street: "8, Connaught Place", city: "Delhi", zip: "110001", state: "Delhi" },
    items: [
      {
        productId: "p7",
        quantity: 1,
        price: 899,
        unit: "kg",
        selectedOptions: { cut: "Curry Cut" },
        product: {
          title: "Pomfret (White)",
          images: [{ url: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000005",
    status: "Completed",
    total: 3200,
    createdAt: new Date("2024-03-10T12:00:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u5", name: "Mohammed Farhan", email: "mfarhan@hotmail.com", phone: "+91 99001 23456", avatar: null },
    shippingAddress: { name: "Mohammed Farhan", street: "22, Brigade Road", city: "Bengaluru", zip: "560001", state: "Karnataka" },
    items: [
      {
        productId: "p8",
        quantity: 2,
        price: 1100,
        unit: "kg",
        selectedOptions: { cut: "Fillet" },
        product: {
          title: "Tuna Steak",
          images: [{ url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200" }],
        },
      },
      {
        productId: "p9",
        quantity: 2,
        price: 500,
        unit: "250g",
        selectedOptions: {},
        product: {
          title: "Squid (Cleaned)",
          images: [{ url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000006",
    status: "Rejected",
    total: 640,
    createdAt: new Date("2024-03-09T09:10:00Z").toISOString(),
    rejectionReason: "Surmai is out of stock today. Order cancelled and refund initiated.",
    refundStatus: "Refunded",
    user: { id: "u6", name: "Deepa Menon", email: "deepa.m@gmail.com", phone: "+91 81234 56789", avatar: null },
    shippingAddress: { name: "Deepa Menon", street: "15, Panjim Market", city: "Panaji", zip: "403001", state: "Goa" },
    items: [
      {
        productId: "p10",
        quantity: 1,
        price: 640,
        unit: "kg",
        selectedOptions: { cut: "Full Clean" },
        product: {
          title: "Surmai (King Mackerel)",
          images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200" }],
        },
      },
    ],
  },
];


