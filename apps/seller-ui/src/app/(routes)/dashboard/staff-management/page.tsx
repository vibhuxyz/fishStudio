"use client";

import React, { useState } from "react";
import { Search, UserCheck, UserX, Loader2, Users } from "lucide-react";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import {
  MOCK_STAFF_LIST,
  MOCK_ORDERS,
} from "@/shared/mocks/staffMockData";

// TODO: replace mock data with real API calls when backend is ready:
// const fetchMyStaffs = async () => (await axiosInstance.get("/auth/api/seller/staffs")).data.staffs;
// const searchStaff = async (email: string) => (await axiosInstance.get(`/auth/api/seller/staff/search?email=${email}`)).data.staff;
// const updateAccess = async ({ staffId, isActive }) => axiosInstance.put("/auth/api/seller/staff/access", { staffId, isActive });

const StaffManagementPage = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [staffList, setStaffList] = useState<any[]>(MOCK_STAFF_LIST);
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

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_STAFF_LIST.find(
      (s) => s.email.toLowerCase() === searchEmail.trim().toLowerCase(),
    );
    if (found) {
      // Reflect any access changes already made
      const current = staffList.find((s) => s.id === found.id) ?? found;
      setSearchResult(current);
    } else {
      setSearchError("No staff account found with this email.");
    }
    setSearching(false);
  };

  const handleAccessToggle = (staffId: string, makeActive: boolean) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, isActive: makeActive } : s,
      ),
    );
    if (searchResult && searchResult.id === staffId) {
      setSearchResult((prev: any) => ({ ...prev, isActive: makeActive }));
    }
    showFeedback(
      "success",
      makeActive
        ? "Access granted successfully."
        : "Access revoked successfully.",
      staffId,
    );
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
            {staffList.filter((s) => s.isActive).length}
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
            disabled={searching || !searchEmail.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition text-sm"
          >
            {searching ? (
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
                  onClick={() =>
                    handleAccessToggle(searchResult.id, false)
                  }
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

        {staffList.length === 0 ? (
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
                {staffList.map((staff, idx) => (
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
                          onClick={() => handleAccessToggle(staff.id, false)}
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
    </div>
  );
};

export default StaffManagementPage;
