'use client';

import { useState } from 'react';

export default function SimpleSeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Failed to seed database' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Simple Database Seeding</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            This will create admin user and add some products (without deleting existing data).
          </p>
          
          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              seeding
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
          >
            {seeding ? 'Adding Data...' : 'Add Sample Data'}
          </button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result.success ? (
                <div>
                  <p className="font-medium">✅ {result.message}</p>
                  <p className="text-sm mt-2">Admin Login:</p>
                  <p className="text-sm">Email: {result.admin?.email}</p>
                  <p className="text-sm">Password: {result.admin?.password}</p>
                  <p className="text-sm mt-2">
                    <a href="/products" className="text-blue-600 underline">
                      View Products
                    </a>
                    {' | '}
                    <a href="/login" className="text-blue-600 underline">
                      Login
                    </a>
                  </p>
                </div>
              ) : (
                <div>
                  <p>❌ {result.error}</p>
                  {result.details && (
                    <p className="text-xs mt-1">{result.details}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p><strong>Note:</strong> This approach:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Won't delete existing data</li>
              <li>Creates admin user (admin@example.com / admin123)</li>
              <li>Adds 3 sample products if they don't exist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
