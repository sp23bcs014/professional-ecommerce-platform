"use client";
import React from 'react';
import Link from 'next/link';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shipping Information
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about our shipping policies
          </p>
        </div>

        <div className="grid gap-8">
          {/* Shipping Options */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Options</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-2">Standard Shipping</h3>
                <p className="text-gray-600 mb-2">3-7 business days</p>
                <p className="text-2xl font-bold text-blue-600">FREE</p>
                <p className="text-sm text-gray-500">On orders over $50</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold mb-2">Express Shipping</h3>
                <p className="text-gray-600 mb-2">1-3 business days</p>
                <p className="text-2xl font-bold text-blue-600">$9.99</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-lg font-semibold mb-2">International</h3>
                <p className="text-gray-600 mb-2">7-14 business days</p>
                <p className="text-2xl font-bold text-blue-600">$19.99+</p>
                <p className="text-sm text-gray-500">Varies by location</p>
              </div>
            </div>
          </div>

          {/* Shipping Locations */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Where We Ship</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Domestic Shipping</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• All 50 United States</li>
                  <li>• Alaska & Hawaii</li>
                  <li>• Puerto Rico & US Territories</li>
                  <li>• Military APO/FPO addresses</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">🌍 International Shipping</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Canada & Mexico</li>
                  <li>• United Kingdom & Europe</li>
                  <li>• Australia & New Zealand</li>
                  <li>• Asia Pacific</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing & Handling */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Processing & Handling</h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl">⏰</span>
                <div>
                  <h4 className="font-semibold">Processing Time</h4>
                  <p>All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed the next business day.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl">📍</span>
                <div>
                  <h4 className="font-semibold">Order Tracking</h4>
                  <p>Once your order ships, you'll receive a tracking number via email. Track your package in real-time through our website or the carrier's website.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-purple-500 text-xl">📋</span>
                <div>
                  <h4 className="font-semibold">Special Instructions</h4>
                  <p>Need special delivery instructions? Add them during checkout or contact our customer service team.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="card-warm p-8 rounded-xl border border-gray-200 bg-yellow-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Important Notes</h2>
            
            <div className="space-y-3 text-gray-700">
              <p>• <strong>Free shipping</strong> applies to standard shipping on orders over $50 within the continental US.</p>
              <p>• <strong>International customers</strong> are responsible for any customs duties or taxes.</p>
              <p>• <strong>PO Boxes</strong> are accepted for standard shipping only.</p>
              <p>• <strong>Shipping costs</strong> are calculated based on weight and destination.</p>
              <p>• <strong>Delivery times</strong> exclude weekends and holidays.</p>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <div className="card-warm p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Questions about shipping?
              </h3>
              <p className="text-gray-600 mb-6">
                Our customer service team is here to help with any shipping questions!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="btn-warm"
                >
                  Contact Us
                </Link>
                <Link 
                  href="/faq" 
                  className="btn-cool"
                >
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
