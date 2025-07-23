"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: number; name: string | null; email: string };
}

export default function ProductDetails({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewFormError, setReviewFormError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
    // Fetch reviews
    fetch(`/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setReviewLoading(false);
        // Check if user has already reviewed
        const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (user) {
          const userId = JSON.parse(user).id;
          const mine = data.find((r: Review) => r.user.id === userId);
          setMyReview(mine || null);
        }
      })
      .catch(() => {
        setReviewError("Failed to load reviews.");
        setReviewLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1, productId: product?.id, quantity: 1 }),
    });
    setAdding(false);
    router.push('/cart');
  };

  // Review form handlers
  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewFormError("");
    setReviewSuccess("");
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      setReviewFormError("You must be logged in to review.");
      setReviewSubmitting(false);
      return;
    }
    const userId = JSON.parse(user).id;
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating: Number(reviewForm.rating), comment: reviewForm.comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setReviewSuccess("Review submitted!");
      setMyReview(data);
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: any) {
      setReviewFormError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Calculate average rating
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  if (loading) return <div className="p-10">Loading...</div>;
  if (!product) return <div className="p-10">Product not found.</div>;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg w-full md:w-96 h-96">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="object-contain h-80" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-semibold mb-6">${product.price.toFixed(2)}</p>
          <button
            onClick={addToCart}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={adding}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-2">Reviews</h2>
        {avgRating && <div className="mb-2 text-lg">Average Rating: <span className="text-yellow-500 font-bold">{avgRating}★</span> ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</div>}
        {reviewLoading ? (
          <div>Loading reviews...</div>
        ) : reviewError ? (
          <div className="text-red-500">{reviewError}</div>
        ) : reviews.length === 0 ? (
          <div>No reviews yet.</div>
        ) : (
          <ul className="space-y-4 mb-6">
            {reviews.map((r) => (
              <li key={r.id} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-700">{r.user.name || r.user.email}</span>
                  <span className="text-yellow-500">{r.rating}★</span>
                  <span className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div>{r.comment}</div>
              </li>
            ))}
          </ul>
        )}
        {/* Review Form */}
        {myReview ? (
          <div className="text-green-700 font-semibold">You have already reviewed this product.</div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <label className="font-medium">Your Rating:</label>
              <input type="number" name="rating" min={1} max={5} value={reviewForm.rating} onChange={handleReviewChange} className="w-16 border rounded px-2 py-1" required />
              <span className="text-yellow-500">★</span>
            </div>
            <div>
              <textarea name="comment" value={reviewForm.comment} onChange={handleReviewChange} className="w-full border rounded px-3 py-2" placeholder="Write your review..." required />
            </div>
            {reviewFormError && <div className="text-red-500">{reviewFormError}</div>}
            {reviewSuccess && <div className="text-green-600">{reviewSuccess}</div>}
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit Review"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
