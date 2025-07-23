"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [admin, setAdmin] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) {
      setError("You must be logged in as admin to view this page.");
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(u);
    setAdmin(parsed);
    if (!parsed.isAdmin) {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setError("Failed to load user."));
    fetch(`/api/orders?userId=${id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto mt-10 text-red-500">{error}</div>;
  if (!user) return <div className="max-w-xl mx-auto mt-10">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <div className="mb-4"><span className="font-semibold">ID:</span> {user.id}</div>
      <div className="mb-4"><span className="font-semibold">Email:</span> {user.email}</div>
      <div className="mb-4"><span className="font-semibold">Name:</span> {user.name || '-'}</div>
      <div className="mb-4"><span className="font-semibold">Admin:</span> {user.isAdmin ? 'Yes' : 'No'}</div>
      <div className="mb-4"><span className="font-semibold">Created:</span> {new Date(user.createdAt).toLocaleString()}</div>
      <h2 className="text-xl font-bold mt-8 mb-2">Order History</h2>
      {orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order: any) => (
            <li key={order.id} className="border rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Order #{order.id}</span>
                <span className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>Status: <span className="font-medium">{order.status}</span></div>
              <div>Total: <span className="font-bold">${order.total.toFixed(2)}</span></div>
              <div>
                <span className="font-medium">Items:</span>
                <ul className="list-disc ml-6">
                  {order.items.map((item: any) => (
                    <li key={item.id}>
                      {item.product?.name || item.productId} x {item.quantity} (${item.price.toFixed(2)} each)
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" onClick={() => router.push('/admin/users')}>Back to Users</button>
    </div>
  );
} 