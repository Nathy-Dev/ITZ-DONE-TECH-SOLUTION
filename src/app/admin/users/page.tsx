"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { Shield, ShieldAlert, ShieldCheck, Search } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const users = useQuery(api.admin.listUsers, 
    session?.user?.id ? { providerId: session.user.id } : "skip"
  );

  const updateUserRole = useMutation(api.admin.updateUserRole);

  const handleRoleChange = async (userId: any, newRole: string) => {
    if (!session?.user?.id) return;
    try {
      await updateUserRole({
        providerId: session.user.id,
        targetUserId: userId,
        newRole
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      alert("Failed to update user role");
    }
  };

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-slate-900">
            User Management
          </h1>
          <p className="text-muted-foreground font-medium">
            View and manage all users and their roles on the platform.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-md shadow-blue-600/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-3">User</th>
                <th className="px-4 sm:px-6 py-3">Email</th>
                <th className="px-4 sm:px-6 py-3">Role</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!filteredUsers ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-10 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-10 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 relative">
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-slate-600 font-medium">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && <ShieldCheck className="w-4 h-4 text-rose-500" />}
                        {user.role === "instructor" && <Shield className="w-4 h-4 text-blue-500" />}
                        {(!user.role || user.role === "learner") && <ShieldAlert className="w-4 h-4 text-slate-400" />}
                        <span className={cn(
                          "text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md",
                          user.role === "admin" ? "bg-rose-100 text-rose-700  " :
                          user.role === "instructor" ? "bg-blue-100 text-blue-700  " :
                          "bg-slate-100 text-slate-700  "
                        )}>
                          {user.role || "learner"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <select 
                        value={user.role || "learner"}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto ml-auto p-2 font-bold cursor-pointer outline-none"
                      >
                        <option value="learner">Learner</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
