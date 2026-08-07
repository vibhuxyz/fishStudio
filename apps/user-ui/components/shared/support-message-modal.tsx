"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const REASONS = [
  "Order not received",
  "Wrong or missing item",
  "Item quality issue",
  "Payment or refund issue",
  "Delivery delay",
  "Other",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the composed message once the customer taps send. */
  onSend: (message: string) => void;
}

/**
 * Collects why the customer needs help before handing off to WhatsApp —
 * tapping a reason chip fills the textarea (still editable) rather than
 * silently prefilling nothing, so the seller always gets real context
 * instead of a bare "Please help me with this order."
 */
export function SupportMessageModal({ open, onOpenChange, onSend }: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedReason(null);
      setMessage("");
    }
  }, [open]);

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setMessage(reason === "Other" ? "" : reason);
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Need Help?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">What's this about?</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleSelectReason(reason)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Tell us more <span className="text-destructive">*</span>
            </p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={4}
            />
          </div>

          <Button
            className="h-12 w-full bg-offer-green text-white hover:bg-offer-green/90 disabled:opacity-50"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            Continue on WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
