"use client";
import React from 'react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-lg text-gray-600">
            Easy returns and exchanges within 30 days
          </p>
        </div>

        <div className="grid gap-8">
          {/* Return Policy Overview */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Return Policy</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-semibold mb-2">30 Days</h3>
                <p className="text-gray-600">Return window from delivery date</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-4xl mb-3">🆓</div>
                <h3 className="text-lg font-semibold mb-2">Free Returns</h3>
                <p className="text-gray-600">We cover return shipping costs</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg border border-gray-100">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold mb-2">Fast Refunds</h3>
                <p className="text-gray-600">Processed within 3-5 business days</p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3">✅ What Can Be Returned</h3>
              <ul className="space-y-2 text-green-700">
                <li>• Items in original condition with tags attached</li>
                <li>• Unworn and unwashed clothing</li>
                <li>• Accessories in original packaging</li>
                <li>• Items purchased within the last 30 days</li>
              </ul>
            </div>
          </div>

          {/* Return Process */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How to Return Items</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Start Your Return</h3>
                  <p className="text-gray-700">Log into your account and go to 'Order History'. Find your order and click 'Return Items'.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Select Items & Reason</h3>
                  <p className="text-gray-700">Choose which items you want to return and tell us why. This helps us improve our products!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Print Return Label</h3>
                  <p className="text-gray-700">We'll email you a prepaid return shipping label. No cost to you!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Package & Ship</h3>
                  <p className="text-gray-700">Pack items securely, attach the label, and drop off at any shipping location.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Get Your Refund</h3>
                  <p className="text-gray-700">Once we receive your return, we'll process your refund within 3-5 business days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exchanges */}
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Exchanges</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Size Exchanges</h3>
                <p className="text-gray-700 mb-4">Need a different size? We make it easy to exchange for the perfect fit.</p>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Free size exchanges within 30 days</li>
                  <li>• We'll send the new size first</li>
                  <li>• Return the old size when convenient</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Color/Style Exchanges</h3>
                <p className="text-gray-700 mb-4">Changed your mind about color or style? No problem!</p>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li>• Exchange for same-price items</li>
                  <li>• Pay difference for higher-priced items</li>
                  <li>• Credit issued for lower-priced items</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Cases */}
          <div className="card-warm p-8 rounded-xl border border-gray-200 bg-yellow-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Important Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">❌ Items We Cannot Accept</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Items worn or washed</li>
                  <li>• Items without original tags</li>
                  <li>• Items damaged by customer</li>
                  <li>• Items returned after 30 days</li>
                  <li>• Final sale items</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">💡 Tips for Returns</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Keep original packaging when possible</li>
                  <li>• Check our size guide before ordering</li>
                  <li>• Read product descriptions carefully</li>
                  <li>• Contact us with any questions</li>
                  <li>• Take photos if item arrives damaged</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <div className="card-warm p-8 rounded-xl border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Need Help with a Return?
              </h3>
              <p className="text-gray-600 mb-6">
                Our customer service team is here to make your return experience smooth and easy!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="btn-warm"
                >
                  Contact Support
                </a>
                <a 
                  href="/orders" 
                  className="btn-cool"
                >
                  View Your Orders
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
