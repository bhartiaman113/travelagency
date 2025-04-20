import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BusBooking from './pages/BusBooking';
import HotelBooking from './pages/HotelBooking';
import CabBooking from './pages/CabBooking';
import Packages from './pages/Packages';
import ServiceProvider from './pages/ServiceProvider';
import Profile from './pages/Profile';
import AddService from './pages/AddService';
import AddHotel from './pages/AddHotel';
import AddBus from './pages/AddBus';
import AddCab from './pages/AddCab';
import Checkout from './pages/Checkout';
import { AuthProvider } from './contexts/AuthContext';
import ViewBookingsPage from './pages/ViewBookings';
import ManageService from './pages/ManageService';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bus-booking" element={<BusBooking />} />
              <Route path="/hotel-booking" element={<HotelBooking />} />
              {/* <Route path="/cab-booking" element={<CabBooking />} /> */}
              <Route path="/packages" element={<Packages />} />
              <Route path="/service-provider" element={<ServiceProvider />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-service" element={<AddService />} />
              <Route path="/add-hotel" element={<AddHotel />} />
              <Route path="/add-bus" element={<AddBus />} />
              <Route path="/add-cab" element={<AddCab />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/view-bookings" element={<ViewBookingsPage />} />
              <Route path="/manage-service" element={<ManageService />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;