import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Package,
  Cpu,
  X,
  PhoneCall,
  Mail,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { Category } from '../types';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, isAdmin, logout } = useAuth();
  const { count: cartCount, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userPincode, setUserPincode] = useState(() => localStorage.getItem('vk_user_pincode') || '500001');
  const [pincodeInput, setPincodeInput] = useState(userPincode);
  const [locationName, setLocationName] = useState(() => localStorage.getItem('vk_user_location') || 'India');

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.categories.getAll()
      .then(res => {
        if (Array.isArray(res?.categories)) {
          setCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input with URL params if on products page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  const handleSavePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.trim().length === 6) {
      setUserPincode(pincodeInput.trim());
      localStorage.setItem('vk_user_pincode', pincodeInput.trim());
      // Friendly location name based on pincode
      let loc = 'India';
      if (pincodeInput.startsWith('534')) loc = 'West Godavari / AP';
      else if (pincodeInput.startsWith('530') || pincodeInput.startsWith('531')) loc = 'Visakhapatnam';
      else if (pincodeInput.startsWith('520') || pincodeInput.startsWith('521')) loc = 'Vijayawada';
      else if (pincodeInput.startsWith('500')) loc = 'Hyderabad';
      else if (pincodeInput.startsWith('560')) loc = 'Bengaluru';
      else if (pincodeInput.startsWith('600')) loc = 'Chennai';
      else loc = `PIN ${pincodeInput}`;

      setLocationName(loc);
      localStorage.setItem('vk_user_location', loc);
      setIsLocationModalOpen(false);
    }
  };

  return (
    <header className="bg-vk-dark text-white sticky top-0 z-50 shadow-md">
      {/* Top Notice Bar */}
      <div className="bg-[#0c1117] text-gray-300 text-xs py-1 px-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Special Offer
          </span>
          <span className="truncate">
            Free Express Delivery on orders above ₹999 • All India Fast Shipping from Andhra Pradesh
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-gray-400">
          <a href="mailto:admin@vktechnology.shop" className="flex items-center space-x-1 hover:text-white transition">
            <Mail size={12} className="text-amber-400" />
            <span>Support: admin@vktechnology.shop</span>
          </a>
          <Link to="/contact" className="hover:text-white transition">24/7 Help</Link>
          <Link to="/track" className="hover:text-white transition">Track Order</Link>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 hover:border border-white rounded text-white flex items-center"
          aria-label="Open Navigation"
        >
          <Menu size={24} />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 p-1 hover:border border-white rounded group">
          <img
            src="/logo.png"
            alt="VK Technology Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-full bg-white p-0.5 shadow-md transform group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center leading-tight">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                VK
              </span>
              <span className="text-lg sm:text-xl font-bold text-amber-400 ml-1">
                Technology
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-gray-300 font-semibold hidden sm:inline -mt-0.5">
              DIY Projects • IoT • Robotics
            </span>
          </div>
        </Link>

        {/* Deliver to Location Pin */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="hidden md:flex items-center space-x-1 p-1.5 hover:border border-white rounded text-left group"
          title="Click to change delivery pincode"
        >
          <MapPin size={18} className="text-gray-300 mt-1 group-hover:text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-300 leading-tight">Deliver to</span>
            <span className="text-xs font-bold leading-tight truncate max-w-[130px]">
              {locationName} {userPincode}
            </span>
          </div>
        </button>

        {/* Amazon-style Large Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-3xl flex items-center">
          <div className="flex w-full rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amber-500">
            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-2.5 border-r border-gray-300 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[150px] truncate hidden sm:block"
            >
              <option value="">All Categories</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Input field */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Arduino, ESP32, sensors, robotics, drone kits..."
                className="w-full px-3 py-2 text-sm text-gray-900 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-600 mr-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 sm:px-5 flex items-center justify-center transition-colors font-medium"
              aria-label="Search Products"
            >
              <Search size={20} className="text-gray-900" />
            </button>
          </div>
        </form>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3 text-sm">
          {/* Country / Currency */}
          <div className="hidden xl:flex items-center space-x-1 p-1.5 text-gray-300">
            <span className="text-base">🇮🇳</span>
            <span className="text-xs font-bold text-white">₹ INR</span>
          </div>

          {/* Account & Lists Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center space-x-1 p-1.5 hover:border border-white rounded text-left group"
            >
              <UserIcon size={20} className="text-gray-300 group-hover:text-amber-400 sm:hidden" />
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] text-gray-300 leading-tight">
                  {user ? `Hello, ${user.full_name.split(' ')[0]}` : 'Hello, sign in'}
                </span>
                <span className="text-xs font-bold leading-tight flex items-center">
                  Account & Lists <ChevronDown size={12} className="ml-0.5 text-gray-400" />
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-md shadow-2xl py-3 border border-gray-200 z-50 text-xs">
                {!user ? (
                  <div className="px-4 pb-3 border-b border-gray-100 text-center">
                    <Link
                      to="/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="block w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-2 rounded-md shadow-sm transition text-center mb-1.5"
                    >
                      Sign In
                    </Link>
                    <span className="text-gray-500 text-[11px]">
                      New customer?{' '}
                      <Link
                        to="/register"
                        onClick={() => setIsAccountOpen(false)}
                        className="text-vk-blue hover:underline font-semibold"
                      >
                        Start here.
                      </Link>
                    </span>
                  </div>
                ) : (
                  <div className="px-4 pb-2 border-b border-gray-100">
                    <p className="font-bold text-gray-800 text-sm truncate">{user.full_name}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <ShieldCheck size={12} className="mr-1" /> Authorized Admin
                      </span>
                    )}
                  </div>
                )}

                {/* Account Navigation Links */}
                <div className="py-2">
                  <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Your Account
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setIsAccountOpen(false)}
                    className="block px-4 py-1.5 hover:bg-gray-100 text-gray-700"
                  >
                    Your Profile & Addresses
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsAccountOpen(false)}
                    className="block px-4 py-1.5 hover:bg-gray-100 text-gray-700"
                  >
                    Your Orders & Tracking
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsAccountOpen(false)}
                    className="block px-4 py-1.5 hover:bg-gray-100 text-gray-700 flex justify-between"
                  >
                    <span>Your Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-1.5 rounded-full text-[10px]">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Admin Direct Portal Link */}
                  {isAdmin ? (
                    <div className="mt-2 pt-2 border-t border-gray-100 bg-amber-50/50">
                      <div className="px-4 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Management
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => setIsAccountOpen(false)}
                        className="block px-4 py-1.5 text-amber-900 font-bold hover:bg-amber-100 flex items-center"
                      >
                        <ShieldCheck size={14} className="mr-1.5 text-amber-600" />
                        Admin Dashboard & Store Controls
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Link
                        to="/admin/login"
                        onClick={() => setIsAccountOpen(false)}
                        className="block px-4 py-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 flex items-center"
                      >
                        <ShieldCheck size={14} className="mr-1.5 text-gray-400" />
                        Store Owner / Admin Login
                      </Link>
                    </div>
                  )}

                  {user && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsAccountOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-1.5 text-red-600 hover:bg-red-50 font-medium flex items-center"
                      >
                        <LogOut size={14} className="mr-1.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Returns & Orders Quick Link */}
          <Link
            to="/orders"
            className="hidden lg:flex flex-col p-1.5 hover:border border-white rounded text-left"
          >
            <span className="text-[11px] text-gray-300 leading-tight">Returns</span>
            <span className="text-xs font-bold leading-tight">& Orders</span>
          </Link>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="flex items-center space-x-1 p-1.5 hover:border border-white rounded relative group"
            title="Wishlist"
          >
            <div className="relative">
              <Heart size={22} className="text-gray-300 group-hover:text-red-400 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold hidden xl:inline">Wishlist</span>
          </Link>

          {/* Cart Icon & Live Amount */}
          <Link
            to="/cart"
            className="flex items-center space-x-1 p-1.5 hover:border border-white rounded group"
          >
            <div className="relative flex items-center">
              <ShoppingCart size={26} className="text-white group-hover:text-amber-400 transition-colors" />
              <span className="absolute -top-1 left-3 bg-amber-400 text-gray-900 text-xs font-black rounded-full px-1.5 min-w-[20px] text-center shadow-md">
                {cartCount}
              </span>
            </div>
            <div className="hidden sm:flex flex-col ml-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold leading-none">Cart</span>
              <span className="text-xs font-bold text-amber-400 leading-tight">
                ₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Pincode / Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Choose your location</h3>
                <p className="text-xs text-gray-500">
                  Select a delivery location to see product availability and dispatch estimates.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePincode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter a 6-digit Indian Pincode
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 534204"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-4 py-2 rounded-md text-sm shadow-sm transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">VK Technology Hub & Fulfillment:</p>
                <p>📍 Fast Express Dispatch across all States & Union Territories of India</p>
                <p className="text-emerald-700 font-medium">
                  ⚡ Same/Next-Day dispatch on all orders
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
