// MOCK DATA — swap fetchOrders with real axiosInstance call once backend is live
export const MOCK_STAFF = {
  id: "staff_mock_001",
  name: "Alex Johnson",
  email: "alex@shop.com",
  role: "staff" as const,
  isActive: true,
  sellerId: "seller_mock_001",
  seller: {
    id: "seller_mock_001",
    store: {
      name: "FishStudio Store",
    },
  },
};

export const MOCK_ORDERS = [
  {
    id: "ord_mock_000001",
    status: "Paid",
    total: 129.99,
    createdAt: new Date("2024-03-01T10:00:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u1", name: "Sarah Connor", email: "sarah@example.com", avatar: null },
    shippingAddress: { name: "Sarah Connor", street: "123 Oak Street", city: "New York", zip: "10001" },
    items: [
      {
        productId: "p1",
        quantity: 2,
        price: 59.99,
        selectedOptions: { color: "Blue", size: "M" },
        product: {
          title: "Classic Fishing Rod",
          images: [{ url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200" }],
        },
      },
      {
        productId: "p2",
        quantity: 1,
        price: 10.01,
        selectedOptions: {},
        product: {
          title: "Fishing Line 50m",
          images: [{ url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000002",
    status: "Accepted",
    total: 249.00,
    createdAt: new Date("2024-03-05T14:30:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u2", name: "James Miller", email: "james@example.com", avatar: null },
    shippingAddress: { name: "James Miller", street: "45 River Rd", city: "Chicago", zip: "60601" },
    items: [
      {
        productId: "p3",
        quantity: 1,
        price: 249.00,
        selectedOptions: { material: "Carbon Fiber" },
        product: {
          title: "Pro Casting Rod",
          images: [{ url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000003",
    status: "Rejected",
    total: 74.50,
    createdAt: new Date("2024-03-08T09:15:00Z").toISOString(),
    rejectionReason: "Item currently out of stock — we are unable to fulfil this order.",
    refundStatus: "Refunded",
    user: { id: "u3", name: "Emily Chen", email: "emily@example.com", avatar: null },
    shippingAddress: { name: "Emily Chen", street: "9 Maple Ave", city: "Seattle", zip: "98101" },
    items: [
      {
        productId: "p4",
        quantity: 1,
        price: 74.50,
        selectedOptions: { color: "Red" },
        product: {
          title: "Spinning Reel 3000",
          images: [{ url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000004",
    status: "Paid",
    total: 39.95,
    createdAt: new Date("2024-03-10T11:00:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u4", name: "Robert Kim", email: "robert@example.com", avatar: null },
    shippingAddress: { name: "Robert Kim", street: "77 Lakeside Dr", city: "Austin", zip: "73301" },
    items: [
      {
        productId: "p5",
        quantity: 3,
        price: 13.31,
        selectedOptions: {},
        product: {
          title: "Fishing Hooks (Pack of 50)",
          images: [{ url: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=200" }],
        },
      },
    ],
  },
  {
    id: "ord_mock_000005",
    status: "Paid",
    total: 310.00,
    createdAt: new Date("2024-03-12T16:45:00Z").toISOString(),
    rejectionReason: null,
    refundStatus: null,
    user: { id: "u5", name: "Mia Brown", email: "mia@example.com", avatar: null },
    shippingAddress: { name: "Mia Brown", street: "2 Harbor Blvd", city: "Miami", zip: "33101" },
    items: [
      {
        productId: "p6",
        quantity: 1,
        price: 210.00,
        selectedOptions: { color: "Black", size: "Large" },
        product: {
          title: "Waterproof Fishing Jacket",
          images: [{ url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200" }],
        },
      },
      {
        productId: "p7",
        quantity: 2,
        price: 50.00,
        selectedOptions: {},
        product: {
          title: "Tackle Box Deluxe",
          images: [{ url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200" }],
        },
      },
    ],
  },
];
