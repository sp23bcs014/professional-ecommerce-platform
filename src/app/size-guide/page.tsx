"use client";
import React, { useState } from 'react';

export default function SizeGuidePage() {
  const [activeCategory, setActiveCategory] = useState<'clothing' | 'shoes' | 'accessories'>('clothing');

  const sizeGuides = {
    clothing: {
      title: "Clothing Size Guide",
      description: "Find your perfect fit with our comprehensive clothing size chart",
      sizes: [
        { size: "XS", chest: "32-34", waist: "26-28", hips: "34-36" },
        { size: "S", chest: "34-36", waist: "28-30", hips: "36-38" },
        { size: "M", chest: "36-38", waist: "30-32", hips: "38-40" },
        { size: "L", chest: "38-40", waist: "32-34", hips: "40-42" },
        { size: "XL", chest: "40-42", waist: "34-36", hips: "42-44" },
        { size: "XXL", chest: "42-44", waist: "36-38", hips: "44-46" }
      ],
      headers: ["Size", "Chest (inches)", "Waist (inches)", "Hips (inches)"]
    },
    shoes: {
      title: "Shoe Size Guide", 
      description: "International shoe size conversion chart",
      sizes: [
        { size: "6", us: "6", uk: "5.5", eu: "39", cm: "24.5" },
        { size: "7", us: "7", uk: "6.5", eu: "40", cm: "25.5" },
        { size: "8", us: "8", uk: "7.5", eu: "41", cm: "26.0" },
        { size: "9", us: "9", uk: "8.5", eu: "42", cm: "27.0" },
        { size: "10", us: "10", uk: "9.5", eu: "43", cm: "28.0" },
        { size: "11", us: "11", uk: "10.5", eu: "44", cm: "29.0" },
        { size: "12", us: "12", uk: "11.5", eu: "45", cm: "30.0" }
      ],
      headers: ["US", "US Size", "UK Size", "EU Size", "Length (cm)"]
    },
    accessories: {
      title: "Accessories Size Guide",
      description: "Size guide for belts, watches, and other accessories",
      sizes: [
        { size: "S", belt: "28-32", watch: "6.5-7", ring: "6-7" },
        { size: "M", belt: "32-36", watch: "7-7.5", ring: "7-8" },
        { size: "L", belt: "36-40", watch: "7.5-8", ring: "8-9" },
        { size: "XL", belt: "40-44", watch: "8-8.5", ring: "9-10" }
      ],
      headers: ["Size", "Belt (inches)", "Watch (inches)", "Ring Size"]
    }
  } as const;

  const measurementTips = [
    {
      title: "How to Measure Your Chest",
      description: "Measure around the fullest part of your chest, keeping the measuring tape horizontal."
    },
    {
      title: "How to Measure Your Waist", 
      description: "Measure around your natural waistline, which is typically the narrowest part of your torso."
    },
    {
      title: "How to Measure Your Hips",
      description: "Measure around the fullest part of your hips, approximately 8 inches below your waistline."
    },
    {
      title: "How to Measure Your Feet",
      description: "Stand on a piece of paper and trace your foot. Measure from heel to longest toe."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Size Guide
          </h1>
          <p className="text-lg text-gray-600">
            Find your perfect fit with our comprehensive size charts
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(Object.keys(sizeGuides) as Array<keyof typeof sizeGuides>).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Size Guide */}
        <div className="card-warm p-8 rounded-xl border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {sizeGuides[activeCategory].title}
          </h2>
          <p className="text-gray-600 mb-6">
            {sizeGuides[activeCategory].description}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  {sizeGuides[activeCategory].headers.map((header, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuides[activeCategory].sizes.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 px-4 py-3 text-gray-700">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measurement Tips */}
        <div className="card-warm p-8 rounded-xl border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Measure
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {measurementTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {tip.title}
                </h3>
                <p className="text-gray-700">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fit Tips */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Perfect Fit Tips
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span>Measure yourself wearing the undergarments you plan to wear with the item</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span>Use a flexible measuring tape for the most accurate measurements</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span>When between sizes, choose the larger size for a more comfortable fit</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">•</span>
                <span>Check the product description for specific fit notes</span>
              </li>
            </ul>
          </div>

          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still Unsure?
            </h3>
            <p className="text-gray-700 mb-6">
              Don't worry! We offer free size exchanges within 30 days. Order your best guess size and exchange if needed.
            </p>
            <div className="space-y-3">
              <a 
                href="/contact" 
                className="block text-center btn-warm"
              >
                Contact Our Fit Experts
              </a>
              <a 
                href="/returns" 
                className="block text-center btn-cool"
              >
                Learn About Exchanges
              </a>
            </div>
          </div>
        </div>

        {/* International Sizing Note */}
        <div className="card-warm p-6 rounded-xl border border-gray-200 bg-blue-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📏 Sizing Note
            </h3>
            <p className="text-gray-700">
              Our sizes follow US standards. International customers, please refer to our conversion charts above. 
              All measurements are in inches unless otherwise specified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
