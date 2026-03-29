import { cookies } from "next/headers";
import { frontendEnv } from "@/lib/env";

export async function fetchServerOrders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${frontendEnv.apiUrl}/order/api/user-orders`, {
      headers: {
        Cookie: cookieHeader,
        "x-auth-role": "user",
        "ngrok-skip-browser-warning": "true",
      },
      next: {
        revalidate: 0, // Orders are dynamic, don't cache on server indefinitely
        tags: ["user-orders"],
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error("Error fetching orders on server:", error);
    return [];
  }
}

export async function fetchServerOrderById(orderId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${frontendEnv.apiUrl}/order/api/get-order/${orderId}`, {
      headers: {
        Cookie: cookieHeader,
        "x-auth-role": "user",
        "ngrok-skip-browser-warning": "true",
      },
      next: {
        revalidate: 0,
        tags: [`order-${orderId}`],
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.order || null;
  } catch (error) {
    console.error(`Error fetching order ${orderId} on server:`, error);
    return null;
  }
}
