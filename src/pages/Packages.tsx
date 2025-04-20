import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Check } from 'lucide-react';

interface PackageType {
  id: string;
  name: string;
  type: 'regular' | 'premium' | 'luxury';
  description: string;
  price: number;
  duration_days: number;
  inclusions: string[];
}

function Packages() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchPackages();
  }, [selectedType]);

  async function fetchPackages() {
    try {
      setLoading(true);
      let query = supabase.from('packages').select('*');

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEmailRequest(pkg: PackageType) {
    const subject = encodeURIComponent(`Package Inquiry: ${pkg.name}`);
    const body = encodeURIComponent(`Hi,

I would like to inquire about the ${pkg.name} (${pkg.type}) package.

Details:
- Duration: ${pkg.duration_days} days
- Price: ₹${pkg.price}
- Inclusions: ${pkg.inclusions.join(', ')}

Please share more information.

Thanks.`);
    window.location.href = `mailto:bhartiaman113114@gmail.com?subject=${subject}&body=${body}`;
  }

  const packageTypes = ['all', 'regular', 'premium', 'luxury'];

  const imagesByType: Record<string, string> = {
    regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
    premium: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
    luxury: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Travel Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated travel packages designed to provide unforgettable experiences
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {packageTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  type === 'all' ? 'rounded-l-md' : ''
                } ${
                  type === 'luxury' ? 'rounded-r-md' : ''
                } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 capitalize`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={imagesByType[pkg.type]}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-indigo-600 capitalize">
                    {pkg.type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{pkg.duration_days} days</span>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Inclusions:</h4>
                    <ul className="space-y-2">
                      {pkg.inclusions?.map((inclusion, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₹{pkg.price}
                      </p>
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                    <button
                      onClick={() => handleEmailRequest(pkg)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Request Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Packages;
