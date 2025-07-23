"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with error handling
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
).catch((error) => {
  console.error('Failed to load Stripe:', error);
  return null;
});

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

// Stripe Checkout Form Component
function StripeCheckoutForm({ 
  selectedTotal, 
  shippingAddress, 
  cartItems, 
  onSuccess, 
  onError 
}: {
  selectedTotal: number;
  shippingAddress: any;
  cartItems: CartItem[];
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Payment system is not ready. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Validate form data
      const trimmedAddress = {
        fullName: shippingAddress.fullName?.trim(),
        streetAddress: shippingAddress.streetAddress?.trim(),
        city: shippingAddress.city?.trim(),
        state: shippingAddress.state?.trim(),
        zipCode: shippingAddress.zipCode?.trim(),
        country: shippingAddress.country?.trim()
      };

      if (!trimmedAddress.fullName || !trimmedAddress.streetAddress || 
          !trimmedAddress.city || !trimmedAddress.state || 
          !trimmedAddress.zipCode || !trimmedAddress.country) {
        throw new Error('Please fill in all required shipping address fields.');
      }

      // Create payment intent with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const intentResponse = await fetch('/api/stripe/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(selectedTotal * 100),
          currency: 'usd',
          cartItems: cartItems
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      
      const { clientSecret } = await intentResponse.json();

      if (!clientSecret) {
        throw new Error('Invalid payment setup. Please try again.');
      }

      // Confirm payment with timeout
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information is not ready. Please refresh and try again.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: trimmedAddress.fullName,
            address: {
              line1: trimmedAddress.streetAddress,
              city: trimmedAddress.city,
              state: trimmedAddress.state,
              postal_code: trimmedAddress.zipCode,
              country: 'US',
            },
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        throw new Error('Payment was not completed successfully');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onError('Payment request timed out. Please try again.');
      } else {
        onError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-premium">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: false,
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Your payment information is secure and encrypted.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-premium w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${selectedTotal.toFixed(2)}`
        )}
      </button>
    </form>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [stripeLoadError, setStripeLoadError] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: ""
  });

  const allSelected = cart && cart.items && selected.length === cart.items.length && cart.items.length > 0;

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!user) {
      setError("You must be logged in to view your cart.");
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const userId = JSON.parse(user).id;
        const res = await fetch(`/api/cart?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
        if (data.items) {
          setSelected(data.items.map((item: CartItem) => item.id));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();

    // Check if Stripe loaded properly
    stripePromise.then((stripe) => {
      if (!stripe) {
        setStripeLoadError(true);
        console.error('Stripe failed to load');
      }
    }).catch(() => {
      setStripeLoadError(true);
    });
  }, []);

  const toggleSelectAll = () => {
    if (!cart?.items) return;
    if (allSelected) setSelected([]);
    else setSelected(cart.items.map(i => i.id));
  };

  const handlePaymentSuccess = async () => {
    setCheckoutLoading(true);
    
    try {
      let userId: number | null = null;
      const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (user) {
        userId = JSON.parse(user).id;
      }

      const shippingAddressString = `${shippingAddress.fullName}\n${shippingAddress.streetAddress}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}\n${shippingAddress.country}${shippingAddress.phone ? `\nPhone: ${shippingAddress.phone.trim()}` : ''}`;
      
      // Create order after successful payment
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          cartItemIds: selected,
          shippingAddress: shippingAddressString,
          paymentMethod: "Credit Card - Stripe",
          paymentStatus: "paid"
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      
      console.log('Order created successfully:', data);
      
      // Show success and redirect
      setCheckoutSuccess(true);
      setCart({ items: cart?.items.filter(item => !selected.includes(item.id)) || [] });
      setSelected([]);
      
      // Refresh cart from server
      setTimeout(async () => {
        try {
          const cartRes = await fetch(`/api/cart?userId=${userId}`);
          if (cartRes.ok) {
            const updatedCart = await cartRes.json();
            setCart(updatedCart);
          }
        } catch (error) {
          console.error('Failed to refresh cart:', error);
        }
      }, 500);
      
      // Trigger navbar update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('userUpdated'));
      }
      
      // Redirect to orders
      setTimeout(() => {
        window.location.href = '/orders';
      }, 2000);
      
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCashOrder = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    
    // Validate shipping address
    const trimmedAddress = {
      fullName: shippingAddress.fullName.trim(),
      streetAddress: shippingAddress.streetAddress.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      zipCode: shippingAddress.zipCode.trim(),
      country: shippingAddress.country.trim()
    };
    
    if (!trimmedAddress.fullName || !trimmedAddress.streetAddress || !trimmedAddress.city || 
        !trimmedAddress.state || !trimmedAddress.zipCode || !trimmedAddress.country) {
      setCheckoutError("Please fill in all required shipping address fields.");
      setCheckoutLoading(false);
      return;
    }

    try {
      let userId: number | null = null;
      const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (user) {
        userId = JSON.parse(user).id;
      }

      const shippingAddressString = `${trimmedAddress.fullName}\n${trimmedAddress.streetAddress}\n${trimmedAddress.city}, ${trimmedAddress.state} ${trimmedAddress.zipCode}\n${trimmedAddress.country}${shippingAddress.phone ? `\nPhone: ${shippingAddress.phone.trim()}` : ''}`;
      
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          cartItemIds: selected,
          shippingAddress: shippingAddressString,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "pending"
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      
      console.log('Cash order created successfully:', data);
      
      setCheckoutSuccess(true);
      setCart({ items: cart?.items.filter(item => !selected.includes(item.id)) || [] });
      setSelected([]);
      
      setTimeout(async () => {
        try {
          const cartRes = await fetch(`/api/cart?userId=${userId}`);
          if (cartRes.ok) {
            const updatedCart = await cartRes.json();
            setCart(updatedCart);
          }
        } catch (error) {
          console.error('Failed to refresh cart:', error);
        }
      }, 500);
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event('userUpdated'));
      }
      
      setTimeout(() => {
        window.location.href = '/orders';
      }, 2000);
      
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  async function handleRemove(cartItemId: number) {
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      setCart((prev) => prev && prev.items ? { ...prev, items: prev.items.filter(item => item.id !== cartItemId) } : prev);
      setSelected((prev) => prev.filter(id => id !== cartItemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  }

  const selectedTotal = cart?.items
    .filter(item => selected.includes(item.id))
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  const selectedItems = cart?.items.filter(item => selected.includes(item.id)) || [];

  // Stripe wrapper component to handle loading errors
  const StripeWrapper = ({ children }: { children: React.ReactNode }) => {
    const [stripeInstance, setStripeInstance] = useState<any>(null);
    const [stripeError, setStripeError] = useState<string>("");

    useEffect(() => {
      stripePromise
        .then((stripe) => {
          if (stripe) {
            setStripeInstance(stripe);
          } else {
            setStripeError("Failed to load payment system");
          }
        })
        .catch(() => {
          setStripeError("Payment system unavailable");
        });
    }, []);

    if (stripeError || stripeLoadError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-800 font-medium">Payment system temporarily unavailable</p>
              <p className="text-yellow-600 text-sm">Please use Cash on Delivery option or try again later</p>
            </div>
          </div>
        </div>
      );
    }

    if (!stripeInstance) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading payment system...</span>
          </div>
        </div>
      );
    }

    return (
      <Elements stripe={stripeInstance}>
        {children}
      </Elements>
    );
  };

  return (
    <main className="min-h-screen hero-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4 float">Shopping Cart</h1>
          <p className="text-xl text-gray-600">Review your selected items and proceed to checkout</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">Loading your cart...</span>
            </div>
          </div>
        ) : error ? (
          <div className="card-premium text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-premium px-8 py-3"
            >
              Try Again
            </button>
          </div>
        ) : !cart?.items || cart.items.length === 0 ? (
          <div className="card-premium text-center py-16">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <a href="/products" className="btn-premium px-8 py-3">Continue Shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">Cart Items ({cart.items.length})</h2>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected || false}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </label>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected([...selected, item.id]);
                          } else {
                            setSelected(selected.filter(id => id !== item.id));
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl || "/placeholder.png"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">${item.product.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium mt-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              {showCheckoutForm && (
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="card-premium">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Credit/Debit Card</p>
                            <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                          </div>
                        </label>
                        
                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">Cash on Delivery</p>
                            <p className="text-sm text-gray-500">Pay when you receive</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Form */}
                  <div className="card-premium">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                          <input
                            type="text"
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                            className="input-premium w-full"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                          <input
                            type="text"
                            value={shippingAddress.streetAddress}
                            onChange={(e) => setShippingAddress({...shippingAddress, streetAddress: e.target.value})}
                            className="input-premium w-full"
                            placeholder="123 Main Street"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            className="input-premium w-full"
                            placeholder="New York"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                          <input
                            type="text"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                            className="input-premium w-full"
                            placeholder="NY"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                          <input
                            type="text"
                            value={shippingAddress.zipCode}
                            onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                            className="input-premium w-full"
                            placeholder="10001"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                          <input
                            type="text"
                            value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                            className="input-premium w-full"
                            placeholder="United States"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                          <input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                            className="input-premium w-full"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Processing */}
                  {paymentMethod === 'card' ? (
                    <StripeWrapper>
                      <StripeCheckoutForm
                        selectedTotal={selectedTotal}
                        shippingAddress={shippingAddress}
                        cartItems={selectedItems}
                        onSuccess={handlePaymentSuccess}
                        onError={setCheckoutError}
                      />
                    </StripeWrapper>
                  ) : (
                    <button
                      onClick={handleCashOrder}
                      disabled={checkoutLoading || selected.length === 0}
                      className="btn-premium w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Processing Order...
                        </div>
                      ) : (
                        `Place Order (Cash on Delivery) - $${selectedTotal.toFixed(2)}`
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-premium sticky top-24">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items ({selected.length})</span>
                      <span className="font-medium">${selectedTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-blue-600">${selectedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {checkoutSuccess ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-green-800 font-medium">Order placed successfully!</p>
                          <p className="text-green-600 text-sm">Redirecting to your orders...</p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {checkoutError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-800 text-sm font-medium">{checkoutError}</p>
                      </div>
                    </div>
                  )}
                  
                  {!showCheckoutForm ? (
                    <button
                      onClick={() => setShowCheckoutForm(true)}
                      disabled={selected.length === 0}
                      className="btn-premium w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout ({selected.length} items)
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
