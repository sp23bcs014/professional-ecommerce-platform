"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
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
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        // The API returns an object with a products property
        const productsArray = data.products && Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products.");
        setLoading(false);
      });
    // Fetch analytics
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setTrend(data.trend || null);
      })
      .catch(() => {});
    // Fetch activity log
    fetch("/api/admin/activity")
      .then(res => res.json())
      .then(data => setActivity(data))
      .catch(() => {});
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-2xl mx-auto mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Analytics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <div className="text-gray-600">Total Sales</div>
          </div>
          <div className="bg-green-50 p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div className="bg-purple-50 p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          <div className="bg-pink-50 p-4 rounded shadow text-center col-span-1 sm:col-span-2 md:col-span-3">
            <div className="text-lg font-bold">Best Seller: {stats.bestSeller?.name || 'N/A'} ({stats.bestSeller?.sold || 0} sold)</div>
          </div>
        </div>
      )}
      {/* Sales Trend Chart */}
      {trend && (
        <div className="bg-white p-4 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-2">Sales Trend (Last 6 Months)</h2>
          <Line
            data={{
              labels: trend.labels,
              datasets: [
                {
                  label: 'Sales',
                  data: trend.sales,
                  borderColor: 'rgb(37, 99, 235)',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
            height={200}
          />
        </div>
      )}
      {/* Activity Log */}
      {activity.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-2">Recent Admin Activity</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Entity</th>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Details</th>
                <th className="p-2 border">Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((log) => (
                <tr key={log.id}>
                  <td className="p-2 border">{log.user?.name || log.user?.email}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">{log.entity}</td>
                  <td className="p-2 border">{log.entityId || '-'}</td>
                  <td className="p-2 border">{log.details || '-'}</td>
                  <td className="p-2 border">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Export CSV Buttons */}
      <div className="flex gap-4 mb-8">
        <a href="/api/admin/export/orders" download className="px-4 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-700">Export Orders CSV</a>
        <a href="/api/admin/export/users" download className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Export Users CSV</a>
        <a href="/api/admin/export/products" download className="px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700">Export Products CSV</a>
      </div>
      
      {/* Management Buttons - Core Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          className="px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          onClick={() => router.push("/admin/orders")}
        >
          📦 Manage Orders
        </button>
        <button
          className="px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          onClick={() => router.push("/admin/users")}
        >
          👥 Manage Users
        </button>
        <button
          className="px-4 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
          onClick={() => router.push("/admin/categories")}
        >
          🏷️ Manage Categories
        </button>
        <button
          className="px-4 py-3 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors"
          onClick={() => router.push("/admin/coupons")}
        >
          🎫 Manage Coupons
        </button>
      </div>

      {/* Management Buttons - Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          className="px-4 py-3 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          onClick={() => router.push("/admin/newsletter")}
        >
          📧 Newsletter Management
        </button>
        <button
          className="px-4 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors"
          onClick={() => router.push("/admin/new-product")}
        >
          ➕ Add New Product
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.id}</td>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">${p.price.toFixed(2)}</td>
              <td className="p-2 border">{p.stock}</td>
              <td className="p-2 border">
                <button
                  className="px-2 py-1 bg-yellow-400 text-white rounded mr-2"
                  onClick={() => router.push(`/admin/edit-product/${p.id}`)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to delete this product?")) return;
                    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                    setProducts(products.filter(prod => prod.id !== p.id));
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 