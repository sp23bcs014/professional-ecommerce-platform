"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingStatus, setTrackingStatus] = useState("");
  const [saving, setSaving] = useState(false);
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
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setStatus(data.status || "");
        setTrackingNumber(data.trackingNumber || "");
        setTrackingStatus(data.trackingStatus || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order.");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status, trackingNumber, trackingStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      setOrder((prev: any) => ({ ...prev, status, trackingNumber, trackingStatus }));
    } catch (err) {
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto mt-10 text-red-500">{error}</div>;
  if (!order) return <div className="max-w-xl mx-auto mt-10">Order not found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id} Details</h1>
      <div className="mb-4">
        <span className="font-semibold">User:</span> {order.user?.email || order.userId}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Status:</span>
        <select
          className="ml-2 border rounded px-2 py-1"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Tracking Number:</span>
        <input
          className="ml-2 border rounded px-2 py-1"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
          placeholder="Enter tracking number"
        />
      </div>
      <div className="mb-4">
        <span className="font-semibold">Tracking Status:</span>
        <input
          className="ml-2 border rounded px-2 py-1"
          value={trackingStatus}
          onChange={e => setTrackingStatus(e.target.value)}
          placeholder="e.g. In transit, Delivered"
        />
      </div>
      <div className="mb-4">
        <span className="font-semibold">Total:</span> ${order.total.toFixed(2)}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Created:</span> {new Date(order.createdAt).toLocaleString()}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Items:</span>
        <ul className="list-disc ml-6">
          {order.items.map((item: any) => (
            <li key={item.id}>
              {item.product?.name || item.productId} x {item.quantity} (${item.price.toFixed(2)} each)
            </li>
          ))}
        </ul>
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" onClick={() => router.push('/admin/orders')}>Back to Orders</button>
      <button
        className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
} 