import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Bus, Car, Package } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Your Journey Begins Here
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover the world with our comprehensive travel solutions
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Explore Packages
            </Link>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Link to="/hotel-booking" className="block">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 hover:shadow-xl transition-shadow">
          <Hotel className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Hotels</h3>
          <p className="text-gray-600">Find the perfect stay for your journey</p>
        </div>
      </Link>
      <Link to="/bus-booking" className="block">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 hover:shadow-xl transition-shadow">
          <Bus className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Buses</h3>
          <p className="text-gray-600">Book comfortable bus rides</p>
        </div>
      </Link>
      <Link to="/packages" className="block">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden text-center p-6 hover:shadow-xl transition-shadow">
          <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Packages</h3>
          <p className="text-gray-600">Explore our curated travel packages</p>
        </div>
      </Link>
    </div>
  </div>
</div>


    {/* Featured Packages */}
<div className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-center mb-12">Featured Packages</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          type: 'Regular',
          img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80',
          desc: 'Perfect for budget travelers',
        },
        {
          type: 'Premium',
          img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
          desc: 'Enhanced comfort and experiences',
        },
        {
          type: 'Luxury',
          img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          desc: 'Ultimate luxury and exclusivity',
        }
      ].map(({ type, img, desc }) => (
        <div key={type} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={img}
            alt={`${type} Package`}
            className="h-48 w-full object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{type} Package</h3>
            <p className="text-gray-600 mb-4">{desc}</p>
            <Link
              to="/packages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Learn More
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
}

export default Home;