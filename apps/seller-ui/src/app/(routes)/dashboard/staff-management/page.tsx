"use client";

import React, { useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Loader2,
  Users,
  Bike,
  Scissors,
  Trash,
  KeyRound,
} from "lucide-react";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import type { Staff } from "@repo/zod-schema";

type StaffSearchResult = Staff & { isInAnotherShop?: boolean };

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BIKE: "Bike",
  SCOOTER: "Scooter",
  BICYCLE: "Bicycle",
  OTHER: "Other",
};

const RIDER_STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-900/60 text-green-300",
  DELIVERING: "bg-blue-900/60 text-blue-300",
  OFFLINE: "bg-gray-700 text-gray-400",
  ON_LEAVE: "bg-amber-900/60 text-amber-300",
};

const ROLE_LABELS: Record<string, string> = {
  ORDER_MANAGER: "Order Manager",
  RIDER: "Rider",
  CUTTING_STAFF: "Cutting Staff",
};

type OperationalStaffFormValues = {
  name: string;
  username: string;
  password: string;
  phone: string;
  role: "RIDER" | "CUTTING_STAFF";
  vehicleType: string;
  vehicleNumber: string;
  deliveryZone: string;
};

const EMPTY_OPERATIONAL_FORM: OperationalStaffFormValues = {
  name: "",
  username: "",
  password: "",
  phone: "",
  role: "RIDER",
  vehicleType: "BIKE",
  vehicleNumber: "",
  deliveryZone: "",
};

const StaffManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<StaffSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [resetPasswordFor, setResetPasswordFor] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["seller-staffs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/seller/staffs");
      return res.data.staffs || [];
    },
  });

  const searchStaffMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await axiosInstance.get(`/auth/api/seller/staff/search?email=${email}`);
      return res.data.staff;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      setSearchError(null);
    },
    onError: () => {
      setSearchResult(null);
      setSearchError("No staff account found with this email.");
    },
  });

  const toggleAccessMutation = useMutation({
    mutationFn: async (vars: { staffId: string; isActive: boolean }) => {
      await axiosInstance.put("/auth/api/seller/staff/access", vars);
      return vars;
    },
    onSuccess: (vars) => {
      queryClient.invalidateQueries({ queryKey: ["seller-staffs"] });
      if (searchResult && searchResult.id === vars.staffId) {
        setSearchResult((prev) => (prev ? { ...prev, isActive: vars.isActive } : null));
      }
      showFeedback(
        "success",
        vars.isActive ? "Access granted successfully." : "Access revoked successfully.",
        vars.staffId,
      );
    },
    onError: () => {
      showFeedback("error", "Failed to update access.", "");
    },
  });

  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
    staffId: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string, staffId: string) => {
    setActionFeedback({ type, message, staffId });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSearch = () => {
    if (!searchEmail.trim()) return;
    searchStaffMutation.mutate(searchEmail.trim());
  };

  const handleAccessToggle = (staffId: string, makeActive: boolean) => {
    toggleAccessMutation.mutate({ staffId, isActive: makeActive });
  };

  const openAddStaffModal = (role: "RIDER" | "CUTTING_STAFF") => {
    reset({ ...EMPTY_OPERATIONAL_FORM, role });
    setIsAddStaffModalOpen(true);
  };

  /* ── Rider / Cutting Staff (operational staff) ─────────────────────────── */

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<OperationalStaffFormValues>({
    mode: "onChange",
    defaultValues: EMPTY_OPERATIONAL_FORM,
  });
  const selectedRole = watch("role");

  const createOperationalStaffMutation = useMutation({
    mutationFn: async (data: OperationalStaffFormValues) => {
      const payload =
        data.role === "RIDER"
          ? data
          : { name: data.name, username: data.username, password: data.password, phone: data.phone, role: data.role };
      await axiosInstance.post("/auth/api/seller/staff", payload, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-staffs"] });
      reset(EMPTY_OPERATIONAL_FORM);
      setIsAddStaffModalOpen(false);
      toast.success("Staff account created!");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create staff account.");
    },
  });

  const toggleOperationalActiveMutation = useMutation({
    mutationFn: async (vars: { staffId: string; isActive: boolean }) => {
      const res = await axiosInstance.put(
        `/auth/api/seller/staff/${vars.staffId}/toggle-active`,
        { isActive: vars.isActive },
        isProtected,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-staffs"] });
      toast.success(data.warning || "Status updated.");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update status.");
    },
  });

  const deleteOperationalStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      await axiosInstance.delete(`/auth/api/seller/staff/${staffId}`, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-staffs"] });
      toast.success("Staff deleted.");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete staff.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (vars: { staffId: string; newPassword: string }) => {
      await axiosInstance.post(
        `/auth/api/seller/staff/${vars.staffId}/reset-password`,
        { newPassword: vars.newPassword },
        isProtected,
      );
    },
    onSuccess: () => {
      toast.success("Password reset.");
      setResetPasswordFor(null);
      setNewPassword("");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    },
  });

  const operationalStaff = staffList.filter((s: Staff) => s.role !== "ORDER_MANAGER");
  const orderManagerStaff = staffList.filter((s: Staff) => s.role === "ORDER_MANAGER" || !s.role);

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl text-white font-semibold">Staff Management</h2>
          <BreadCrumbs title="Staff Management" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAddStaffModal("CUTTING_STAFF")}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-700 hover:bg-[#1a2235] text-white rounded-lg text-sm font-medium transition"
          >
            <Scissors size={16} />
            Add Cutting Staff
          </button>
          <button
            onClick={() => openAddStaffModal("RIDER")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Bike size={16} />
            Add Rider
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-white">{staffList.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {staffList.filter((s: Staff) => s.isActive).length}
          </p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Riders / Cutting Staff</p>
          <p className="text-2xl font-bold text-blue-400">{operationalStaff.length}</p>
        </div>
      </div>


      {/* Search section (Order Manager staff — self-signup + approval) */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-white font-semibold text-lg mb-1">Add Staff by Email</h3>
        <p className="text-gray-400 text-sm mb-4">
          Search for a staff member by their registered email. They must have
          already created a staff account to appear here.
        </p>
        <div className="flex gap-3">
          <div className="flex items-center flex-1 bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 gap-2">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="email"
              placeholder="staff@example.com"
              className="flex-1 bg-transparent text-white outline-none text-sm"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchStaffMutation.isPending || !searchEmail.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition text-sm"
          >
            {searchStaffMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {searchError && <p className="text-red-400 text-sm mt-3">{searchError}</p>}

        {searchResult && (
          <div
            className={`mt-4 border rounded-xl p-4 flex items-center justify-between bg-[#0d1117] ${
              searchResult.isInAnotherShop ? "border-amber-700/60" : "border-gray-700"
            }`}
          >
            <div>
              <p className="text-white font-medium">{searchResult.name}</p>
              <p className="text-gray-400 text-sm">{searchResult.email}</p>
              {searchResult.isInAnotherShop ? (
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/60 text-amber-300">
                  Already in another shop
                </span>
              ) : (
                <span
                  className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    searchResult.isActive
                      ? "bg-green-900/60 text-green-300"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {searchResult.isActive ? "Active" : "Not Active"}
                </span>
              )}
            </div>
            <div>
              {searchResult.isInAnotherShop ? (
                <p className="text-amber-400 text-sm font-medium max-w-[200px] text-right">
                  This staff is working at another shop. Please hire other staff.
                </p>
              ) : !searchResult.isActive ? (
                <button
                  type="button"
                  onClick={() => handleAccessToggle(searchResult.id, true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                >
                  <UserCheck size={16} />
                  Grant Access
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRevokeId(searchResult.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-medium transition"
                >
                  <UserX size={16} />
                  Revoke Access
                </button>
              )}
            </div>
          </div>
        )}

        {actionFeedback && (
          <div
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
              actionFeedback.type === "success"
                ? "bg-green-900/40 text-green-300 border border-green-700"
                : "bg-red-900/40 text-red-300 border border-red-700"
            }`}
          >
            {actionFeedback.message}
          </div>
        )}
      </div>

      {/* Staff list table */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Users size={20} />
          My Staff Members
        </h3>

        {isLoadingStaff ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 flex justify-center text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-3" size={32} />
          </div>
        ) : staffList.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-8 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No staff members yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#111827] border border-gray-800 rounded-xl">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1a1a2e]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...orderManagerStaff, ...operationalStaff].map((staff: Staff, idx: number) => (
                  <tr
                    key={staff.id}
                    className={`border-b border-gray-800 hover:bg-[#1e2433] transition ${
                      idx % 2 === 0 ? "bg-[#111827]" : "bg-[#131b2e]"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-sm">{staff.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {ROLE_LABELS[staff.role] || staff.role}
                      </span>
                      {staff.role === "RIDER" && staff.riderStatus && (
                        <span
                          className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                            RIDER_STATUS_STYLES[staff.riderStatus] ?? "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {staff.riderStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {staff.email || staff.username || "—"}
                      {staff.phone && <div className="text-gray-500 text-xs">{staff.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          staff.isActive
                            ? "bg-green-900/60 text-green-300"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {staff.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {staff.role === "ORDER_MANAGER" || !staff.role ? (
                        staff.isActive ? (
                          <button
                            type="button"
                            onClick={() => setConfirmRevokeId(staff.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-medium transition"
                          >
                            <UserX size={13} />
                            Revoke
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAccessToggle(staff.id, true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-medium transition"
                          >
                            <UserCheck size={13} />
                            Activate
                          </button>
                        )
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleOperationalActiveMutation.mutate({
                                staffId: staff.id,
                                isActive: !staff.isActive,
                              })
                            }
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition text-white ${
                              staff.isActive ? "bg-red-700 hover:bg-red-800" : "bg-green-700 hover:bg-green-800"
                            }`}
                          >
                            {staff.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            {staff.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetPasswordFor(staff)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition"
                          >
                            <KeyRound size={13} />
                            Reset Password
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(staff.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-lg text-xs font-medium transition"
                          >
                            <Trash size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal (Order Manager) */}
      {confirmRevokeId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative text-center">
            <h2 className="mb-2 text-xl font-bold text-white">Revoke Access?</h2>
            <p className="mb-6 text-sm text-gray-400">
              Are you sure you want to revoke staff access? They will no longer be able to log in or manage orders.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmRevokeId(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAccessToggle(confirmRevokeId, false);
                  setConfirmRevokeId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
              >
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Rider / Cutting Staff) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative text-center">
            <h2 className="mb-2 text-xl font-bold text-white">Delete Staff?</h2>
            <p className="mb-6 text-sm text-gray-400">
              This permanently removes their account and login access. This cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOperationalStaffMutation.mutate(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal (Rider / Cutting Staff) */}
      {resetPasswordFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative">
            <h2 className="mb-2 text-xl font-bold text-white">Reset Password</h2>
            <p className="mb-4 text-sm text-gray-400">
              Set a new password for {resetPasswordFor.name}. They'll need it to log in next time.
            </p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setResetPasswordFor(null);
                  setNewPassword("");
                }}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
                onClick={() =>
                  resetPasswordMutation.mutate({ staffId: resetPasswordFor.id, newPassword })
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rider / Cutting Staff Modal */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-[#111827] p-6 shadow-2xl relative">
            <h2 className="mb-4 text-xl font-bold text-white">
              Add {selectedRole === "RIDER" ? "Rider" : "Cutting Staff"}
            </h2>
            <form
              onSubmit={handleSubmit((data) => createOperationalStaffMutation.mutate(data))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <input
                  placeholder="Full name"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                  {...register("name", { required: true })}
                />
              </div>
              <div>
                <input
                  placeholder="Phone number (10 digits)"
                  maxLength={10}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                  {...register("phone", {
                    required: true,
                    pattern: /^[0-9]{10}$/,
                  })}
                />
              </div>
              <div>
                <input
                  placeholder="Username"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                  {...register("username", { required: true, minLength: 3 })}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                  {...register("password", { required: true, minLength: 6 })}
                />
              </div>

              {selectedRole === "RIDER" && (
                <>
                  <div>
                    <select
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                      {...register("vehicleType", { required: selectedRole === "RIDER" })}
                    >
                      {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      placeholder="Vehicle number"
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                      {...register("vehicleNumber", { required: selectedRole === "RIDER" })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      placeholder="Delivery zone (optional)"
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none"
                      {...register("deliveryZone")}
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || createOperationalStaffMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition text-sm"
                >
                  {createOperationalStaffMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
