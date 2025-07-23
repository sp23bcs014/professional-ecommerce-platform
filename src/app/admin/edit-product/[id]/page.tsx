"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", imageUrl: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
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
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          imageUrl: data.imageUrl || "",
          stock: data.stock?.toString() || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(form.imageUrl || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    let imageUrl = form.imageUrl;
    if (imageFile) {
      setUploading(true);
      const data = new FormData();
      data.append('file', imageFile);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const img = await res.json();
      setUploading(false);
      if (!res.ok) {
        setError(img.error || 'Failed to upload image');
        setSubmitting(false);
        return;
      }
      imageUrl = img.url;
    }
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          imageUrl,
          stock: parseInt(form.stock, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");
      setSuccess("Product updated!");
      setTimeout(() => router.push("/admin"), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-xl mx-auto mt-10">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required min="0" step="0.01" />
        </div>
        <div>
          <label className="block font-medium mb-1">Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
          {(imagePreview || form.imageUrl) && <img src={imagePreview || form.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-contain border rounded" />}
          {uploading && <div className="text-blue-600">Uploading image...</div>}
        </div>
        <div>
          <label className="block font-medium mb-1">Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2" required min="0" />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
} 