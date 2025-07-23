"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const handleTabClick = (tabId: string) => {
    if (tabId === 'orders') {
      router.push('/orders');
    } else {
      setActiveTab(tabId);
    }
  };

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) {
      setError("You must be logged in to view your profile.");
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetch(`/api/auth/profile?userId=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setForm({ name: data.name || "", email: data.email || "", password: "" });
          setAvatar(data.avatar || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
    // Fetch orders
    fetch(`/api/orders?userId=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setOrdersError(data.error);
        else setOrders(data);
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrdersError("Failed to load orders.");
        setOrdersLoading(false);
      });
    
    // Fetch wishlist
    fetch(`/api/wishlist?userId=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setWishlist(data.items);
        }
      })
      .catch(() => {});

    // Fetch recently viewed
    fetch(`/api/recently-viewed?userId=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentlyViewed(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let res, data;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("userId", user.id);
        formData.append("name", form.name);
        formData.append("email", form.email);
        if (form.password) formData.append("password", form.password);
        formData.append("avatar", avatarFile);
        res = await fetch("/api/auth/profile", {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: form.name,
            email: form.email,
            password: form.password ? form.password : undefined,
          }),
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setSuccess("Profile updated successfully.");
      setForm(f => ({ ...f, password: "" }));
      setAvatar(data.avatar || null);
      setAvatarFile(null);
      // Update localStorage if email, name, or avatar changed
      localStorage.setItem("user", JSON.stringify({ ...user, name: data.name, email: data.email, avatar: data.avatar }));
      setUser((u: any) => ({ ...u, name: data.name, email: data.email, avatar: data.avatar }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId })
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.product.id !== productId));
        alert('Removed from wishlist!');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-lg text-gray-600">Loading your profile...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen hero-gradient flex items-center justify-center">
      <div className="card-premium text-center py-16 max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h3>
        <p className="text-gray-600 mb-8">{error}</p>
        <button 
          onClick={() => router.push('/login')} 
          className="btn-premium px-8 py-3"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen hero-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4 float">My Account</h1>
          <p className="text-xl text-gray-600">Manage your profile, orders, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card-premium sticky top-24">
              {/* User Avatar & Info */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-1">{user?.name || "User"}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                {user?.isAdmin && (
                  <div className="mt-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Admin
                    </span>
                  </div>
                )}
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{orders.length}</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{wishlist.length}</div>
                    <div className="text-xs text-gray-500">Wishlist</div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Settings', icon: '👤' },
                  { id: 'orders', label: 'Order History', icon: '📦' },
                  { id: 'wishlist', label: 'Wishlist', icon: '♡' },
                  { id: 'recent', label: 'Recently Viewed', icon: '👁️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-cool text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/cart')}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3M7 13l1.5 3m3.5 0h7" />
                    </svg>
                    <span>Shopping Cart</span>
                  </button>
                  
                  {user?.isAdmin && (
                    <button 
                      onClick={() => router.push('/admin')}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Admin Panel</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      localStorage.removeItem('user');
                      router.push('/');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings Tab */}
            {activeTab === 'profile' && (
              <div className="card-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h2>
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{success}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Profile Picture</label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-gray-200" />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                          Change Picture
                        </label>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max. 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="input-premium w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                        className="input-premium w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      className="input-premium w-full"
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-sm text-gray-500 mt-2">Leave blank if you don't want to change your password</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-premium px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 