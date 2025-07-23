"use client";
import React from "react";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">About Fraz Modern</h1>
      <p className="text-lg mb-8 text-center">Fraz Modern is your destination for stylish, affordable, and high-quality home products. Our mission is to bring modern design to every home, with a focus on comfort, sustainability, and customer happiness.</p>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Our Story</h2>
          <p className="mb-4">Founded in 2024, Fraz Modern started as a small family business with a passion for beautiful interiors. Today, we serve thousands of happy customers across the country, offering a curated selection of furniture, decor, and lifestyle products.</p>
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p>We believe everyone deserves a home they love. We work directly with designers and manufacturers to bring you the best products at fair prices, with a commitment to sustainability and ethical sourcing.</p>
        </div>
        <div className="flex justify-center">
          <img src="/computer.jpg" alt="Our Team" className="rounded-xl shadow-lg w-72 h-72 object-cover" />
        </div>
      </div>
    </main>
  );
} 