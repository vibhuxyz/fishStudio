"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Home,
  Briefcase,
  MoreHorizontal,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { useAddressStore, type Address, type AddressType } from "@/lib/address-store";
import { useAuth } from "@/lib/auth-store";
import { AddressModal } from "@/components/shared/address-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/utils";
import { useModals } from "@/components/providers/modal-provider";
import { useUserSession } from "@/hooks/useUserSession";
import { Loader2 } from "lucide-react";

const ADDRESS_TYPE_ICONS: Record<AddressType, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  Work: <Briefcase className="h-5 w-5" />,
  Other: <MoreHorizontal className="h-5 w-5" />,
};

export default function AddressesPage() {
  const { addresses, selectedAddressId, selectAddress, setAddresses } = useAddressStore();
  const { isLoggedIn } = useAuth();
  const { isLoading: isSessionLoading } = useUserSession();
  const modals = useModals();
  const [showModal, setShowModal] = useState(false);

  if (isSessionLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Saved Addresses</h1>
        </div>
        <div className="py-20 text-center">
          <LogIn className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold text-foreground">Sign in to view addresses</h2>
          <p className="mt-2 text-muted-foreground">Log in to manage your saved delivery addresses.</p>
          <Button
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={modals.openLogin}
          >
            Log in / Sign up
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      const { data } = await axiosInstance.delete(`/auth/api/delete-address/${id}`);
      if (data.success) {
        setAddresses(data.addresses);
        toast.success("Address removed");
      }
    } catch {
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Saved Addresses</h1>
            <p className="text-sm text-muted-foreground">
              {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
            </p>
          </div>
        </div>
        <Button
          className="bg-offer-green text-white hover:bg-offer-green/90 h-9 gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-20 text-center">
          <MapPin className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold text-foreground">No saved addresses</h2>
          <p className="mt-2 text-muted-foreground">Add your home or work address for faster checkout.</p>
          <Button
            className="mt-6 bg-offer-green text-white hover:bg-offer-green/90"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;
            return (
              <div
                key={address.id}
                className={`relative rounded-2xl border transition-colors ${
                  isSelected
                    ? "border-offer-green bg-offer-green/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-start gap-4 p-4 text-left"
                  onClick={() => {
                    selectAddress(address.id);
                    toast.success(`${address.label} set as primary address`);
                  }}
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    isSelected ? "bg-offer-green/15 text-offer-green" : "bg-muted text-muted-foreground"
                  }`}>
                    {ADDRESS_TYPE_ICONS[address.label] ?? <MoreHorizontal className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-foreground">{address.label}</p>
                      {isSelected && (
                        <span className="flex items-center gap-1 rounded-full bg-offer-green/10 border border-offer-green/30 px-2 py-0.5 text-[10px] font-semibold text-offer-green">
                          <CheckCircle2 className="h-3 w-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {address.name} · {address.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}
                      {address.landmark ? `, ${address.landmark}` : ""}
                      {address.area ? `, ${address.area}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}{address.state ? `, ${address.state}` : ""} - {address.pincode}
                    </p>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                  {!isSelected ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => {
                        selectAddress(address.id);
                        toast.success(`${address.label} set as primary address`);
                      }}
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Primary delivery address</span>
                  )}
                  {!isSelected && (
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddressModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
