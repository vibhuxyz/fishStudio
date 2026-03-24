"use client";

import React, { useState } from "react";
import { Search, UserCheck, UserX, Loader2, Users } from "lucide-react";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

// Keeping mock orders just for the stats display
import { MOCK_ORDERS } from "@/shared/mocks/staffMockData";

const StaffManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  
  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["seller-staffs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/api/seller/staffs");
      return res.data.staffs || [];
    }
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
    }
  });

  const toggleAccessMutation = useMutation({
    mutationFn: async (vars: { staffId: string, isActive: boolean }) => {
      await axiosInstance.put("/auth/api/seller/staff/access", vars);
      return vars;
    },
    onSuccess: (vars) => {
      queryClient.invalidateQueries({ queryKey: ["seller-staffs"] });
      if (searchResult && searchResult.id === vars.staffId) {
        setSearchResult((prev: any) => ({ ...prev, isActive: vars.isActive }));
      }
      showFeedback(
        "success",
        vars.isActive
          ? "Access granted successfully."
          : "Access revoked successfully.",
        vars.staffId,
      );
    },
    onError: (err) => {
      showFeedback("error", "Failed to update access.", "");
    }
  });

  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
    staffId: string;
  } | null>(null);

  const showFeedback = (
    type: "success" | "error",
    message: string,
    staffId: string,
  ) => {
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

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">
        Staff Management
      </h2>
      <BreadCrumbs title="Staff Management" />

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Staff</p>
          <p className="text-2xl font-bold text-white">{staffList.length}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {staffList.filter((s: any) => s.isActive).length}
          </p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Orders Managed</p>
          <p className="text-2xl font-bold text-blue-400">{MOCK_ORDERS.length}</p>
        </div>
      </div>

      {/* Search section */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-white font-semibold text-lg mb-1">
          Add Staff by Email
        </h3>
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

        {searchError && (
          <p className="text-red-400 text-sm mt-3">{searchError}</p>
        )}

        {searchResult && (
          <div className="mt-4 border border-gray-700 rounded-xl p-4 flex items-center justify-between bg-[#0d1117]">
            <div>
              <p className="text-white font-medium">{searchResult.name}</p>
              <p className="text-gray-400 text-sm">{searchResult.email}</p>
              <span
                className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  searchResult.isActive
                    ? "bg-green-900/60 text-green-300"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {searchResult.isActive ? "Active" : "Not Active"}
              </span>
            </div>
            <div>
              {!searchResult.isActive ? (
                <button
                  type="button"
                  onClick={() =>
                    handleAccessToggle(searchResult.id, true)
                  }
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
            <p className="text-gray-500 text-sm mt-1">
              Search for a staff email above to add your first team member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#111827] border border-gray-800 rounded-xl">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1a1a2e]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff: any, idx: number) => (
                  <tr
                    key={staff.id}
                    className={`border-b border-gray-800 hover:bg-[#1e2433] transition ${
                      idx % 2 === 0 ? "bg-[#111827]" : "bg-[#131b2e]"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-sm">{staff.name}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{staff.email}</td>
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
                      {staff.isActive ? (
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
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
    </div>
  );
};

export default StaffManagementPage;
