The Problem
Even though the WebSocket was sending messages correctly, the UI was previously relying on a "Refetch" command. Because Next.js caches product data for 5 minutes (to keep the site fast), the browser's request for "new" data was being answered by the server with "old" cached data. This is why you saw the notification but the product didn't actually turn "Out of Stock."

The Solution: Surgical Cache Injection
I have updated the useNotifications hook in the User UI with a much more advanced technique:

Instant Injection: Instead of just asking the server for new data, the dashboard now manually injects the new stock value directly into the browser's memory the exact millisecond the WebSocket message arrives.
Bypasses Server Cache: This approach completely bypasses the 5-minute Next.js server cache because the browser updates its own private copy of the product list instantly.
System-wide Sync: This update is applied across all active screens, including the main product list and the individual product detail pages.