"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
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
    fetch("/api/orders?all=true")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    setStatusUpdating(orderId);
    try {
      const res = await fetch(`/api/orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Order ID</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Items</th>
            <th className="p-2 border">Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => router.push(`/admin/orders/${order.id}`)}>
              <td className="p-2 border">{order.id}</td>
              <td className="p-2 border">{order.user?.email || order.userId}</td>
              <td className="p-2 border">${order.total.toFixed(2)}</td>
              <td className="p-2 border font-semibold">{order.status}</td>
              <td className="p-2 border">{new Date(order.createdAt).toLocaleString()}</td>
              <td className="p-2 border">
                <ul>
                  {order.items.map((item: any) => (
                    <li key={item.id}>{item.product?.name || item.productId} x {item.quantity} (${item.price.toFixed(2)} each)</li>
                  ))}
                </ul>
              </td>
              <td className="p-2 border">
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                  disabled={statusUpdating === order.id}
                  className="border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 