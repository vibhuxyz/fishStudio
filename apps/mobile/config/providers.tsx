import { ConversationProvider } from "@/context/conversation.context";
import { WebSocketProvider } from "@/context/web-socket.context";
import useUser from "@/hooks/useUser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>
        {children}
      </ProvidersWithWebSocket>
    </QueryClientProvider>
  );
}

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();

  return (
    <>
      {user && (
        <WebSocketProvider user={user}>
          <ConversationProvider>{children}</ConversationProvider>
        </WebSocketProvider>
      )}
      {!user && <ConversationProvider>{children}</ConversationProvider>}
    </>
  );
};
