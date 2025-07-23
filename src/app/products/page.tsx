"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const categories = ["All", "Chairs", "Lamps", "Tables", "Decor"];
const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [quickView, setQuickView] = useState<null | any>(null);
  const addToCartBtnRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [search, setSearch] = useState("");
  const [quickViewReviews, setQuickViewReviews] = useState<any[]>([]);
  const [quickViewReviewLoading, setQuickViewReviewLoading] = useState(false);
  const [quickViewReviewError, setQuickViewReviewError] = useState("");
  const [quickViewMyReview, setQuickViewMyReview] = useState<any>(null);
  const [quickViewReviewForm, setQuickViewReviewForm] = useState({ rating: 5, comment: "" });
  const [quickViewReviewSubmitting, setQuickViewReviewSubmitting] = useState(false);
  const [quickViewReviewFormError, setQuickViewReviewFormError] = useState("");
  const [quickViewReviewSuccess, setQuickViewReviewSuccess] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        console.log("API Response:", data); // Debug log
        // The API returns an object with a products property
        const productsArray = data.products && Array.isArray(data.products) ? data.products : [];
        console.log("Products Array:", productsArray); // Debug log
        setProducts(productsArray);
        if (productsArray.length > 0) {
          const min = Math.min(...productsArray.map((p: any) => p.price));
          const max = Math.max(...productsArray.map((p: any) => p.price));
          setPriceRange([min, max]);
        }
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setProducts([]); // Set empty array on error
      });
  }, []);

  useEffect(() => {
    if (quickView) {
      setQuickViewReviewLoading(true);
      fetch(`/api/products/${quickView.id}/reviews`)
        .then(res => res.json())
        .then(data => {
          setQuickViewReviews(data);
          setQuickViewReviewLoading(false);
          // Check if user has already reviewed
          const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
          if (user) {
            const userId = JSON.parse(user).id;
            const mine = data.find((r: any) => r.user.id === userId);
            setQuickViewMyReview(mine || null);
          }
        })
        .catch(() => {
          setQuickViewReviewError("Failed to load reviews.");
          setQuickViewReviewLoading(false);
        });
    }
  }, [quickView]);

  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 1000;

  // Ensure products is always an array before filtering
  const productsArray = Array.isArray(products) ? products : [];
  
  let filtered = productsArray.filter(
    (p) =>
      (selectedCategory === "All" || (p.category && p.category.name === selectedCategory)) &&
      p.price >= priceRange[0] &&
      p.price <= priceRange[1] &&
      (p.rating ?? 0) >= minRating &&
      (p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  async function addToCart(id: number) {
    setCart((prev) => [...prev, id]);
    // Animate button
    const btn = addToCartBtnRefs.current[id];
    if (btn) {
      btn.classList.add("animate-pulse");
      setTimeout(() => btn.classList.remove("animate-pulse"), 500);
    }
    // Add to backend cart
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) return; // Optionally show login prompt
    const userId = JSON.parse(user).id;
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId: id, quantity: 1 }),
    });
  }

  async function toggleWishlist(id: number) {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      alert("Please log in to add items to your wishlist.");
      return;
    }
    
    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id;

    try {
      if (wishlist.includes(id)) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: id }),
        });
        
        if (response.ok) {
          setWishlist((prev) => prev.filter((wid) => wid !== id));
          alert("Removed from wishlist!");
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: id }),
        });
        
        if (response.ok) {
          setWishlist((prev) => [...prev, id]);
          alert("Added to wishlist!");
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert("Failed to update wishlist. Please try again.");
    }
  }

  // Quick view review form handlers
  function handleQuickViewReviewChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setQuickViewReviewForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleQuickViewReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuickViewReviewSubmitting(true);
    setQuickViewReviewFormError("");
    setQuickViewReviewSuccess("");

    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      setQuickViewReviewFormError("Please login to leave a review");
      setQuickViewReviewSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${quickView.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: JSON.parse(user).id,
          rating: Number(quickViewReviewForm.rating),
          comment: quickViewReviewForm.comment
        })
      });

      if (response.ok) {
        setQuickViewReviewSuccess("Review submitted successfully!");
        setQuickViewReviewForm({ rating: 5, comment: "" });
        // Refresh reviews
        const reviewsResponse = await fetch(`/api/products/${quickView.id}/reviews`);
        const reviewsData = await reviewsResponse.json();
        setQuickViewReviews(reviewsData);
      } else {
        setQuickViewReviewFormError("Failed to submit review");
      }
    } catch (error) {
      setQuickViewReviewFormError("Error submitting review");
    }
    setQuickViewReviewSubmitting(false);
  }

  // Calculate quick view average rating
  const quickViewAvgRating = quickViewReviews.length > 0 ? (quickViewReviews.reduce((sum, r) => sum + r.rating, 0) / quickViewReviews.length).toFixed(1) : null;

  return (
    <section className="min-h-screen hero-gradient pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold gradient-text mb-6 float">Premium Collection</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our curated selection of luxury products designed to elevate your lifestyle
          </p>
        </div>

        {/* Filters Section */}
        <div className="card-premium p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Search Products</label>
              <input
                type="text"
                placeholder="Search for products..."
                className="input-premium w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                      selectedCategory === cat
                        ? "btn-premium scale-105 shadow-lg"
                        : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white hover:shadow-md hover:scale-105"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
              <select
                className="input-premium w-full"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Rating Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Price Range</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([minPrice, Number(e.target.value)])}
                  className="flex-1 accent-blue-600"
                />
                <div className="bg-blue-50 px-4 py-2 rounded-lg font-semibold text-blue-700 min-w-[100px] text-center">
                  Up to ${priceRange[1]}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Minimum Rating</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={minRating}
                  onChange={e => setMinRating(Number(e.target.value))}
                  className="flex-1 accent-yellow-500"
                />
                <div className="bg-yellow-50 px-4 py-2 rounded-lg font-semibold text-yellow-700 min-w-[100px] text-center flex items-center justify-center space-x-1">
                  <span>{minRating}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((product) => (
            <div key={product.id} className="card-premium group overflow-hidden">
              {/* Product Image */}
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-all duration-700"
                />
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setQuickView(product)}
                    className="bg-white/90 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-white transition-colors"
                  >
                    Quick View
                  </button>
                  <button
                    ref={(ref) => { addToCartBtnRefs.current[product.id] = ref; }}
                    onClick={() => addToCart(product.id)}
                    className={`group relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      cart.includes(product.id)
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200 hover:shadow-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {cart.includes(product.id) ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </div>
                    {!cart.includes(product.id) && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                </div>
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    wishlist.includes(product.id)
                      ? "bg-pink-500 text-white"
                      : "bg-white/90 text-gray-700 hover:bg-pink-50"
                  }`}
                >
                  {wishlist.includes(product.id) ? "♥" : "♡"}
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold gradient-text">${product.price}</div>
                  <div className="flex items-center space-x-1">
                    {product.rating && (
                      <>
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      View Details →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-8 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setPriceRange([minPrice, maxPrice]);
                setMinRating(0);
              }}
              className="btn-premium px-8 py-3"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Quick View Modal */}
        {quickView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">Product Details</h2>
                  <button
                    onClick={() => setQuickView(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                    <img
                      src={quickView.imageUrl}
                      alt={quickView.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">{quickView.name}</h3>
                      <p className="text-gray-600 leading-relaxed">{quickView.description}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(quickView.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-medium text-gray-700">{quickView.rating}</span>
                      {quickViewAvgRating && (
                        <span className="text-sm text-gray-500">
                          ({quickViewReviews.length} {quickViewReviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>

                    {/* Price and Stock */}
                    <div className="space-y-3">
                      <div className="text-3xl font-bold gradient-text">${quickView.price.toFixed(2)}</div>
                      <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                        quickView.stock > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {quickView.stock > 0 ? `${quickView.stock} In Stock` : 'Out of Stock'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        className={`group relative w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-xl ${
                          quickView.stock > 0
                            ? cart.includes(quickView.id)
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-200 hover:shadow-blue-300"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={quickView.stock <= 0}
                        onClick={() => addToCart(quickView.id)}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          {cart.includes(quickView.id) ? (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Added to Cart</span>
                            </>
                          ) : quickView.stock > 0 ? (
                            <>
                              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6" />
                              </svg>
                              <span>Add to Cart</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Out of Stock</span>
                            </>
                          )}
                        </div>
                        {quickView.stock > 0 && !cart.includes(quickView.id) && (
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                      </button>
                      
                      <div className="flex gap-3">
                        <button
                          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                            wishlist.includes(quickView.id)
                              ? "bg-pink-100 text-pink-700"
                              : "bg-gray-100 text-gray-700 hover:bg-pink-50"
                          }`}
                          onClick={() => toggleWishlist(quickView.id)}
                        >
                          {wishlist.includes(quickView.id) ? "♥ In Wishlist" : "♡ Add to Wishlist"}
                        </button>
                        
                        <Link
                          href={`/products/${quickView.id}`}
                          className="flex-1 btn-cool py-3 px-4 text-center"
                        >
                          🔍 Full Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                {quickViewReviews.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {quickViewReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
