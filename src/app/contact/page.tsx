"use client";
import React from "react";

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="text-lg mb-8 text-center">Have a question or need help? Fill out the form below and our team will get back to you soon.</p>
      <form className="bg-white rounded-xl shadow-md p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input className="w-full border border-gray-300 rounded-md px-3 py-2" id="name" name="name" type="text" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input className="w-full border border-gray-300 rounded-md px-3 py-2" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
          <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" id="message" name="message" rows={4} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition">Send Message</button>
      </form>
      <div className="mt-10 text-center text-gray-500">
        <p>Email: support@frazmodern.com</p>
        <p>Phone: +1 (555) 123-4567</p>
      </div>
    </main>
  );
} 