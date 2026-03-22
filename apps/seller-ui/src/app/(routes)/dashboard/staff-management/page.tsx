"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Loader2, Users } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import BreadCrumbs from "@/shared/components/breadcrumbs";

// ── Fetch my staff list ──────────────────────────────────────────────────────
const fetchMyStaffs = async () => {
  const res = await axiosInstance.get("/auth/api/seller/staffs");
  return res.data.staffs;
};

// ── Search staff by email ────────────────────────────────────────────────────
const searchStaff = async (email: string) => {
  const res = await axiosInstance.get(
    `/auth/api/seller/staff/search?email=${encodeURIComponent(email)}`,
  );
  return res.data.staff;
};

const StaffManagementPage = () => {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    message: string;
    staffId: string;
  } | null>(null);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["my-staffs"],
    queryFn: fetchMyStaffs,
  });

  const accessMutation = useMutation({
    mutationFn: async ({
      staffId,
      isActive,
    }: {
      staffId: string;
      isActive: boolean;
    }) => {
      const res = await axiosInstance.put("/auth/api/seller/staff/access", {
        staffId,
        isActive,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-staffs"] });
      setActionFeedback({
        type: "success",
        message: data.message,
        staffId: variables.staffId,
      });
      // If the searched staff was the one acted on, refresh it
      if (searchResult && searchResult.id === variables.staffId) {
        setSearchResult((prev: any) => ({
          ...prev,
          isActive: variables.isActive,
        }));
      }
      setTimeout(() => setActionFeedback(null), 3000);
    },
    onError: (error: any, variables) => {
      setActionFeedback({
        type: "error",
        message:
          error?.response?.data?.message || "Failed to update staff access",
        staffId: variables.staffId,
      });
      setTimeout(() => setActionFeedback(null), 3000);
    },
  });

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await searchStaff(searchEmail.trim());
      setSearchResult(result);
    } catch (err: any) {
      setSearchError(
        err?.response?.data?.message ||
          "No staff account found with this email.",
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">
        Staff Management
      </h2>
      <BreadCrumbs title="Staff Management" />

      {/* Search section */}
      <div className="mt-6 bg-gray-900 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-1">
          Add Staff by Email
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Search for a staff member by their email address. They must have
          already registered a staff account to appear here.
        </p>
        <div className="flex gap-3">
          <div className="flex items-center flex-1 bg-gray-800 rounded-lg px-3 py-2 gap-2">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="email"
              placeholder="staff@example.com"
              className="flex-1 bg-transparent text-white outline-none"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchEmail.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
          >
            {searching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Search result */}
        {searchError && (
          <p className="text-red-400 text-sm mt-3">{searchError}</p>
        )}
        {searchResult && (
          <div className="mt-4 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{searchResult.name}</p>
              <p className="text-gray-400 text-sm">{searchResult.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  searchResult.isActive
                    ? "bg-green-900/60 text-green-300"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {searchResult.isActive ? "Active" : "Not Active"}
              </span>
            </div>
            <div className="flex gap-2">
              {!searchResult.isActive ? (
                <button
                  type="button"
                  onClick={() =>
                    accessMutation.mutate({
                      staffId: searchResult.id,
                      isActive: true,
                    })
                  }
                  disabled={accessMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  <UserCheck size={16} />
                  Grant Access
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    accessMutation.mutate({
                      staffId: searchResult.id,
                      isActive: false,
                    })
                  }
                  disabled={accessMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  <UserX size={16} />
                  Revoke Access
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action feedback */}
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

      {/* Current staff list */}
      <div className="mt-8">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Users size={20} />
          My Staff Members
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : staffList.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No staff members yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Search for a staff email above to add your first team member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900 rounded-xl">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-left text-sm text-gray-400">Name</th>
                  <th className="p-4 text-left text-sm text-gray-400">Email</th>
                  <th className="p-4 text-left text-sm text-gray-400">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm text-gray-400">
                    Joined
                  </th>
                  <th className="p-4 text-left text-sm text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff: any) => (
                  <tr
                    key={staff.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="p-4 font-medium">{staff.name}</td>
                    <td className="p-4 text-gray-300">{staff.email}</td>
                    <td className="p-4">
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
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {staff.isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            accessMutation.mutate({
                              staffId: staff.id,
                              isActive: false,
                            })
                          }
                          disabled={
                            accessMutation.isPending &&
                            actionFeedback?.staffId === staff.id
                          }
                          className="flex items-center gap-1 px-3 py-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
                        >
                          <UserX size={14} />
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            accessMutation.mutate({
                              staffId: staff.id,
                              isActive: true,
                            })
                          }
                          disabled={
                            accessMutation.isPending &&
                            actionFeedback?.staffId === staff.id
                          }
                          className="flex items-center gap-1 px-3 py-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
                        >
                          <UserCheck size={14} />
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
    </div>
  );
};

export default StaffManagementPage;
