"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      setError("You must be logged in to view this order.");
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto mt-10 text-red-500">{error}</div>;
  if (!order) return <div className="max-w-xl mx-auto mt-10">Order not found.</div>;

  const canCancel = order && (order.status === "pending" || order.status === "processing");

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel order");
      setOrder((prev: any) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id} Details</h1>
      <div className="mb-4">
        <span className="font-semibold">Status:</span> {order.status}
      </div>
      {order.trackingNumber && (
        <div className="mb-4">
          <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
        </div>
      )}
      {order.trackingStatus && (
        <div className="mb-4">
          <span className="font-semibold">Tracking Status:</span> {order.trackingStatus}
        </div>
      )}
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
            <li key={item.id} className="flex items-center gap-4 mb-2">
              <img
                src={item.product?.imageUrl || "/placeholder.png"}
                alt={item.product?.name || item.productId}
                className="w-12 h-12 rounded object-cover border"
              />
              <div>
                <div className="font-medium">
                  {item.product?.id ? (
                    <Link href={`/products/${item.product.id}`} className="text-blue-600 hover:underline">
                      {item.product.name}
                    </Link>
                  ) : (
                    item.product?.name || item.productId
                  )}
                </div>
                <div className="text-gray-500 text-sm">Qty: {item.quantity} (${item.price.toFixed(2)} each)</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" onClick={() => router.push('/orders')}>Back to Orders</button>
      {canCancel && (
        <button
          className="mt-4 ml-4 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
} 