"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category?: {
      name: string;
    };
    rating?: number;
  };
  createdAt: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<{ items: WishlistItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) {
      setError("You must be logged in to view your wishlist.");
      setLoading(false);
      return;
    }
    
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
    const userId = parsedUser.id;

    fetch(`/api/wishlist?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setWishlist(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load wishlist.");
        setLoading(false);
      });
  }, []);

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;

    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId })
      });

      if (res.ok) {
        setWishlist(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.product.id !== productId)
        } : null);
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = async (productId: number) => {
    if (!user) return;

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, quantity: 1 })
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center">Loading your wishlist...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center text-red-500">{error}</div>
        {!user && (
          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              Login to view your wishlist
            </Link>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-16 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlist?.items.length || 0} {(wishlist?.items.length || 0) === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      {!wishlist?.items.length ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">♡</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love by clicking the heart icon</p>
          <Link 
            href="/products" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group">
              <div className="relative">
                <img
                  src={item.product.imageUrl || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition"
                />
                <button
                  onClick={() => removeFromWishlist(item.product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-red-500 hover:text-red-600 transition"
                  title="Remove from wishlist"
                >
                  ❌
                </button>
                {item.product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {item.product.name}
                  </h3>
                  <div className="text-xl font-bold text-blue-600 ml-2">
                    ${item.product.price.toFixed(2)}
                  </div>
                </div>
                
                {item.product.category && (
                  <p className="text-sm text-gray-500 mb-2">{item.product.category.name}</p>
                )}
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.product.description}
                </p>

                {item.product.rating && (
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(item.product.rating))}
                      {'☆'.repeat(5 - Math.floor(item.product.rating))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600">
                      ({item.product.rating.toFixed(1)})
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item.product.id)}
                    disabled={item.product.stock === 0}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                      item.product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  <Link
                    href={`/products/${item.product.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    View
                  </Link>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Added {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlist?.items.length ? (
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : null}
    </main>
  );
}
