import { useGetRoom } from "@workspace/api-client-react";
import { getGetRoomQueryKey } from "@workspace/api-client-react";

interface EscrowStatusProps {
  roomId: string;
}

export default function EscrowStatus({ roomId }: EscrowStatusProps) {
  const { data } = useGetRoom(roomId, {
    query: {
      enabled: !!roomId,
      queryKey: getGetRoomQueryKey(roomId),
      refetchInterval: 10000,
    },
  });

  const escrow = data?.escrow;
  const status = escrow?.status ?? "empty";

  if (status === "empty") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="status-escrow-empty">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        <span>No escrow</span>
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="flex items-center gap-2 text-xs" data-testid="status-escrow-locked">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-400 font-medium">
          {escrow?.amount} {escrow?.currency} locked in escrow
        </span>
        {escrow?.paymentLinkUrl && (
          <a
            href={escrow.paymentLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline ml-1"
          >
            Pay via StreamPay
          </a>
        )}
      </div>
    );
  }

  if (status === "released") {
    return (
      <div className="flex items-center gap-2 text-xs" data-testid="status-escrow-released">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-emerald-400 font-medium">Payment released</span>
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <div className="flex items-center gap-2 text-xs" data-testid="status-escrow-disputed">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-destructive font-medium">Dispute raised — funds frozen</span>
      </div>
    );
  }

  return null;
}
