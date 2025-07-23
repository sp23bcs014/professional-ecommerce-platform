"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  rating?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  products: Product[];
  _count: {
    products: number;
  };
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/categories/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCategory(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load category');
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center">Loading category...</div>
      </main>
    );
  }

  if (error || !category) {
    return (
      <main className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center text-red-500">{error || 'Category not found'}</div>
        <div className="text-center mt-4">
          <Link href="/categories" className="text-blue-600 hover:underline">
            ← Back to Categories
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-4">
        {/* Category Header */}
        <div className="mb-12">
          <nav className="mb-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {category.imageUrl && (
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-gray-600 mb-2">
                  {category.description}
                </p>
              )}
              <p className="text-gray-500">
                {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {category.products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products in this category</h2>
            <p className="text-gray-600 mb-6">Products will appear here once they are added</p>
            <Link 
              href="/products" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow group"
              >
                <div className="relative mb-4">
                  <img
                    src={product.imageUrl || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {product.rating && (
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 text-sm">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600">
                      ({product.rating.toFixed(1)})
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.stock > 0 && (
                    <span className="text-sm text-green-600">
                      {product.stock} in stock
                    </span>
                  )}
                </div>
                
                <Link
                  href={`/products/${product.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href={`/products?categoryId=${category.id}`}
            className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition mr-4"
          >
            View All {category.name} Products
          </Link>
          <Link
            href="/categories"
            className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Browse Other Categories
          </Link>
        </div>
      </div>
    </main>
  );
}
