"use client";
import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-7 business days. Express shipping takes 1-3 business days. International shipping takes 7-14 business days."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all items in original condition. Items must be unworn, unwashed, and with original tags attached."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide! International shipping costs vary by location and will be calculated at checkout."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account under 'Order History'."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay through our secure Stripe payment system."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "You can change or cancel your order within 1 hour of placing it. After that, please contact our customer service team."
    },
    {
      question: "Do you have a size guide?",
      answer: "Yes! Check our Size Guide page for detailed measurements and fitting information for all our products."
    },
    {
      question: "How do I care for my items?",
      answer: "Care instructions are included with each item. Generally, we recommend following the care label instructions and washing in cold water."
    },
    {
      question: "Do you offer gift cards?",
      answer: "Yes, we offer digital gift cards in various amounts. Perfect for gifting! Contact us for more information."
    },
    {
      question: "How can I contact customer service?",
      answer: "You can reach us through our Contact page, email us at support@frazmodern.com, or call us at 1-800-FRAZ-MOD."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about FrazModern
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card-warm p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="card-warm p-8 rounded-xl border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer service team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="btn-warm"
              >
                Contact Us
              </a>
              <a 
                href="mailto:support@frazmodern.com" 
                className="btn-cool"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
