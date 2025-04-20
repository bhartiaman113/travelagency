import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Hotel, Bus, Car, Package, UserCircle, LogOut } from 'lucide-react';

function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Plane className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TravelEase</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/hotel-booking"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Hotel className="h-4 w-4 mr-1" />
                Hotels
              </Link>
              <Link
                to="/bus-booking"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Bus className="h-4 w-4 mr-1" />
                Buses
              </Link>
              {/* <Link
                to="/cab-booking"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Car className="h-4 w-4 mr-1" />
                Cabs
              </Link> */}
              <Link
                to="/packages"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                <Package className="h-4 w-4 mr-1" />
                Packages
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/service-provider"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Become a Provider
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center text-gray-900"
                >
                  <UserCircle className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center text-gray-900"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;