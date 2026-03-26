"use client";

import React from "react";
import { Info, Truck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BillSummaryProps {
  itemTotal: number;
  deliveryCharge: number;
  discount: number;
  discountBreakdown?: { code: string; amount: number }[];
  extraCharge?: number;
  extraChargeLabel?: string;
  onPlaceOrder: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function BillSummary({
  itemTotal,
  deliveryCharge,
  discount,
  discountBreakdown,
  extraCharge = 0,
  extraChargeLabel = "Extra Charge",
  onPlaceOrder,
  isLoading,
  disabled,
}: BillSummaryProps) {
  const totalPayable = itemTotal + deliveryCharge + extraCharge - discount;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-bold text-card-foreground">Bill Details</h2>
      
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Item Total</span>
          <span className="font-medium text-foreground">₹{itemTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Delivery Charge</span>
          </div>
          <span className={cn("font-medium", deliveryCharge === 0 ? "text-offer-green" : "text-foreground")}>
            {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}
          </span>
        </div>

        {extraCharge > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>{extraChargeLabel}</span>
            </div>
            <span className="font-medium text-destructive">
              +₹{extraCharge.toFixed(2)}
            </span>
          </div>
        )}

        {discountBreakdown && discountBreakdown.length > 0 ? (
          discountBreakdown.map((item) => (
            <div key={item.code} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-offer-green font-medium">
                <Ticket className="h-4 w-4" />
                <span>Coupon ({item.code})</span>
              </div>
              <span className="font-bold text-offer-green">-₹{item.amount.toFixed(0)}</span>
            </div>
          ))
        ) : discount > 0 ? (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-offer-green font-medium">
              <Ticket className="h-4 w-4" />
              <span>Discount</span>
            </div>
            <span className="font-bold text-offer-green">-₹{discount.toFixed(0)}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-base font-bold text-card-foreground">Total Payable</span>
        <span className="text-xl font-black text-card-foreground">₹{totalPayable.toFixed(2)}</span>
      </div>

      <div className="mt-2 rounded-lg bg-muted/50 p-3">
        <div className="flex gap-2">
          <Info className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            By placing the order, you agree to our terms and conditions. 
            Estimated delivery time: 30-45 mins.
          </p>
        </div>
      </div>

      <Button
        className="mt-2 w-full h-12 text-base font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98]"
        onClick={onPlaceOrder}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            <span>Processing...</span>
          </div>
        ) : (
          "Place Order"
        )}
      </Button>
    </div>
  );
}
