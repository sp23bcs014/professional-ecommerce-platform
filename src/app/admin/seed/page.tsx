'use client';

import { useState } from 'react';

export default function AdminSeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed', {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Seeding</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the button below to seed your database with sample products and create an admin user.
          </p>
          
          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              seeding
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {seeding ? 'Seeding Database...' : 'Seed Database'}
          </button>

          {result && (
            <div className={`p-4 rounded-md ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result.success ? (
                <div>
                  <p className="font-medium">✅ Database seeded successfully!</p>
                  <p className="text-sm mt-2">Admin Login:</p>
                  <p className="text-sm">Email: {result.admin?.email}</p>
                  <p className="text-sm">Password: {result.admin?.password}</p>
                  <p className="text-sm mt-2">
                    <a href="/login" className="text-blue-600 underline">
                      Go to Login Page
                    </a>
                  </p>
                </div>
              ) : (
                <p>❌ {result.error}</p>
              )}
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p><strong>Note:</strong> This will create:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>9 sample products</li>
              <li>Admin user (admin@example.com / admin123)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
