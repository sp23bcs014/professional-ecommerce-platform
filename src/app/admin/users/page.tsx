"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) {
      setError("You must be logged in as admin to view this page.");
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(u);
    setUser(parsed);
    if (!parsed.isAdmin) {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users.");
        setLoading(false);
      });
  }, []);

  const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      setUsers(users.map(u => u.id === userId ? { ...u, isAdmin } : u));
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone and will also delete all their orders and reviews.`)) {
      return;
    }
    
    setDeleting(userId);
    try {
      const res = await fetch(`/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      setUsers(users.filter(u => u.id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Admin?</th>
            <th className="p-2 border">Created</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-blue-50">
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border font-semibold">{u.isAdmin ? "Yes" : "No"}</td>
              <td className="p-2 border">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    View
                  </button>
                  {user.id !== u.id && (
                    <>
                      <button
                        className={`px-2 py-1 rounded text-xs ${u.isAdmin ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"} text-white`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAdmin(u.id, !u.isAdmin);
                        }}
                        disabled={updating === u.id}
                      >
                        {updating === u.id ? "..." : (u.isAdmin ? "Remove Admin" : "Make Admin")}
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(u.id, u.email);
                        }}
                        disabled={deleting === u.id}
                      >
                        {deleting === u.id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 