"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      setError("You must be logged in to view your orders.");
      setLoading(false);
      return;
    }
    const userId = JSON.parse(user).id;
    fetch(`/api/orders?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <main className="min-h-screen hero-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    </main>
  );
  
  if (error) return (
    <main className="min-h-screen hero-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="card-warm p-8 rounded-xl border border-red-200 bg-red-50">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Orders</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <a href="/login" className="btn-warm">
                Login
              </a>
              <a href="/products" className="btn-cool">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen hero-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">Order History</h1>
          <p className="text-xl text-gray-600">
            Track your purchases and order status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center">
            <div className="card-warm p-12 rounded-xl border border-gray-200">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
              <p className="text-lg text-gray-600 mb-8">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <div className="flex justify-center space-x-4">
                <a href="/products" className="btn-warm px-8 py-3">
                  Shop Now
                </a>
                <a href="/categories" className="btn-cool px-8 py-3">
                  Browse Categories
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card-warm rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">
                          ${order.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          ✓ Completed
                        </div>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="btn-warm px-6 py-2 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Items ({order.items.length})
                  </h4>
                  <div className="grid gap-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h5>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-center py-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View {order.items.length - 3} more items
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Have questions about your orders? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-warm">
                Contact Support
              </Link>
              <Link href="/faq" className="btn-cool">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
