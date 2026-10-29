import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Mail,
  Send
} from 'lucide-react';
import { BannerSlider } from '../components/BannerSlider';
import { ProductCard } from '../components/ProductCard';
import { StarRating } from '../components/StarRating';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { getCategoryIcon } from '../components/Navbar';
import { useCatalogSync } from '../hooks/useCatalogSync';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll({ limit: 40 })
      ]);

      setCategories(Array.isArray(catsRes?.categories) ? catsRes.categories : []);
      setAllProducts(Array.isArray(prodsRes?.products) ? prodsRes.products : []);

      const stored = localStorage.getItem('vk_recently_viewed');
      if (stored) {
        try {
          setRecentlyViewed(JSON.parse(stored).slice(0, 6));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, []);

  // Real-time live catalog sync across devices
  useCatalogSync(() => {
    loadData();
  });

  // Filter sections
  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  const bestSellers = safeProducts.filter(p => p.rating_count && p.rating_count > 1).slice(0, 5);
  const featuredKits = safeProducts.filter(p => p.category_slug === 'student-diy-project-kits' || p.category_slug === 'iot-development-kits' || p.is_featured).slice(0, 5);
  const arduinoEspProducts = safeProducts.filter(p => p.category_slug === 'arduino-boards-and-kits' || p.category_slug === 'esp32-and-esp8266').slice(0, 5);
  const sensorProducts = safeProducts.filter(p => p.category_slug === 'sensors-and-modules').slice(0, 5);
  const roboticsDroneProducts = safeProducts.filter(p => p.category_slug === 'robotics-kits' || p.category_slug === 'drone-components').slice(0, 5);
  const newArrivals = [...safeProducts].sort((a, b) => b.id - a.id).slice(0, 5);
  const specialOffers = safeProducts.filter(p => p.discounted_price && p.discounted_price < p.regular_price).slice(0, 5);
  const recommendedProducts = safeProducts.slice(0, 5);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pb-12">
      {/* Hero Banner Slider */}
      <BannerSlider />

      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 -mt-16 sm:-mt-24 lg:-mt-32 relative z-20 space-y-6">
        {/* Section 1: Shop by Category (Amazon 4-card grid overlay) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Arduino & Microcontrollers */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Arduino & Microcontrollers
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link to="/category/arduino-boards-and-kits" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=300&q=80"
                      alt="Arduino Boards"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    Arduino UNO & Mega
                  </span>
                </Link>

                <Link to="/category/esp32-and-esp8266" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=300&q=80"
                      alt="ESP32 WiFi"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    ESP32 & NodeMCU
                  </span>
                </Link>
              </div>
            </div>
            <Link to="/category/arduino-boards-and-kits" className="text-xs font-bold text-vk-blue hover:text-amber-700 hover:underline flex items-center">
              <span>Explore all microcontrollers</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>

          {/* Card 2: Robotics & Drones */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Robotics & Drone Tech
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link to="/category/robotics-kits" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=300&q=80"
                      alt="Robotics Chassis"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    4WD Smart Cars
                  </span>
                </Link>

                <Link to="/category/drone-components" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=300&q=80"
                      alt="Drone Quadcopter"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    F450 & Brushless
                  </span>
                </Link>
              </div>
            </div>
            <Link to="/category/robotics-kits" className="text-xs font-bold text-vk-blue hover:text-amber-700 hover:underline flex items-center">
              <span>Shop robotics & quadcopters</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>

          {/* Card 3: Sensors & IoT */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Sensors & Prototyping
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link to="/category/sensors-and-modules" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"
                      alt="Sensors Modules"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    Ultrasonic, MPU6050
                  </span>
                </Link>

                <Link to="/category/electronic-components" className="group">
                  <div className="bg-gray-50 rounded p-2 aspect-square flex items-center justify-center overflow-hidden mb-1">
                    <img
                      src="https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=300&q=80"
                      alt="Breadboards"
                      className="object-contain w-full h-full group-hover:scale-105 transition"
                    />
                  </div>
                  <span className="text-xs text-gray-700 font-medium group-hover:text-amber-600 block truncate">
                    Breadboard & Jumper
                  </span>
                </Link>
              </div>
            </div>
            <Link to="/category/sensors-and-modules" className="text-xs font-bold text-vk-blue hover:text-amber-700 hover:underline flex items-center">
              <span>View 45+ sensor modules</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>

          {/* Card 4: Student Project Kits */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Student Project Kits
                </h3>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
                  With Code
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Complete engineering project kits with source code, circuit diagrams, and technical documentation.
              </p>
              <div className="bg-gray-50 rounded p-2 aspect-video flex items-center justify-center overflow-hidden mb-3">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
                  alt="Student Project Kits"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
            <Link to="/category/student-diy-project-kits" className="text-xs font-bold text-vk-blue hover:text-amber-700 hover:underline flex items-center">
              <span>Explore final year kits</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>
        </section>

        {/* Categories Strip */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Explore All Product Categories
              </h2>
              <p className="text-xs text-gray-500">
                Pick from our carefully curated catalog of DIY electronic building blocks
              </p>
            </div>
            <Link to="/products" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight size={14} className="ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 hover:border-amber-400 hover:bg-amber-50/30 transition duration-150"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.icon, 22)}
                </div>
                <span className="text-xs font-semibold text-gray-800 group-hover:text-amber-800 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  {cat.product_count || 5}+ products
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Best-Selling Products */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-amber-500" size={22} />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Best-Selling DIY Products
              </h2>
            </div>
            <Link to="/products?sort=bestselling" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>See more</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 3: Featured DIY Project Kits */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-amber-500" size={22} />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Featured DIY Project Kits
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Complete kits with step-by-step schematics and Arduino/ESP32 code
                </p>
              </div>
            </div>
            <Link to="/category/student-diy-project-kits" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>View all kits</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {featuredKits.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 4: Arduino & ESP32 Products */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="text-blue-600" size={22} />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Arduino & ESP32 Development Boards
              </h2>
            </div>
            <Link to="/category/arduino-boards-and-kits" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>Browse microcontrollers</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {arduinoEspProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 5: Sensors and Modules */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Sensors, Transducers & Modules
              </h2>
            </div>
            <Link to="/category/sensors-and-modules" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>View all sensors</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {sensorProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 6: Robotics & Drone Components */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Robotics Chassis & Drone Hardware
              </h2>
            </div>
            <Link to="/category/robotics-kits" className="text-xs font-bold text-vk-blue hover:underline flex items-center">
              <span>View robotics & drones</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {roboticsDroneProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 7: Special Offers & New Arrivals (Two-column card block) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Special Offers */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-base text-gray-900">
                Special Offers & Discounts
              </h3>
              <Link to="/products?featured=true" className="text-xs text-vk-blue hover:underline font-semibold">
                View deals
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specialOffers.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="font-bold text-base text-gray-900">
                New Arrivals in Tech
              </h3>
              <Link to="/products?sort=newest" className="text-xs text-vk-blue hover:underline font-semibold">
                See all new
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {newArrivals.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 8: Recommended Products */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Recommended for Engineering Makers
            </h2>
            <Link to="/products" className="text-xs font-bold text-vk-blue hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {recommendedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* Section 9: Recently Viewed Products (if any) */}
        {recentlyViewed.length > 0 && (
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              Recently Viewed Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Section 10: Why Choose VK Technology? */}
        <section className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Trust & Reliability
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">
              Why Engineers & Makers Choose VK Technology
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Shipping genuine electronics, robotics modules, and DIY project kits across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">100% Genuine Components</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Tested ICs, authentic microcontrollers, and premium build quality components.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Fast Express Dispatch</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Same-day processing with fast, tracked express delivery across India.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Student Project Support</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Working circuit diagrams, code samples, and expert guidance for student projects.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Dedicated WhatsApp Help</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Direct WhatsApp technical help for troubleshooting component hookups.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 11: Customer Reviews */}
        <section className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews & Feedback</h2>
              <p className="text-xs text-gray-500">Verified purchases from engineering students and electronics enthusiasts</p>
            </div>
            <div className="flex items-center space-x-1">
              <StarRating rating={4.9} size={16} />
              <span className="text-xs font-bold text-gray-700 ml-1">4.9 / 5.0 (500+ Reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <StarRating rating={5} size={14} />
                <h4 className="font-bold text-sm text-gray-900 mt-2">Best place for college project components!</h4>
                <p className="text-xs text-gray-600 mt-1 italic">
                  "Ordered the Smart Agriculture IoT kit for our final year project. The package reached Bhimavaram within 24 hours. The code and circuit diagram worked seamlessly with Blynk IoT."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-gray-800">Suresh Reddy, ECE Student</span>
                <span className="text-emerald-700 font-medium">✓ Verified Purchase</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <StarRating rating={5} size={14} />
                <h4 className="font-bold text-sm text-gray-900 mt-2">Original Arduino and quality sensors</h4>
                <p className="text-xs text-gray-600 mt-1 italic">
                  "Authentic chips with clear markings. The 45-in-1 sensor kit is completely organized in a sturdy box. Highly recommended for diploma and engineering colleges."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-gray-800">Kavitha M., Robotics Hobbyist</span>
                <span className="text-emerald-700 font-medium">✓ Verified Purchase</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <StarRating rating={5} size={14} />
                <h4 className="font-bold text-sm text-gray-900 mt-2">Outstanding WhatsApp Technical Support</h4>
                <p className="text-xs text-gray-600 mt-1 italic">
                  "I was having an issue uploading firmware to the ESP32-CAM board. The VK Technology team assisted me on WhatsApp within 10 minutes and sorted the CP2102 driver. Superb service!"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-gray-800">Anand Verma, Maker</span>
                <span className="text-emerald-700 font-medium">✓ Verified Purchase</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 12: Newsletter Subscription */}
        <section className="bg-gradient-to-r from-gray-900 to-vk-dark text-white p-6 sm:p-10 rounded-lg shadow-lg text-center">
          <div className="max-w-xl mx-auto">
            <div className="w-12 h-12 bg-amber-400 text-gray-950 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
              <Mail size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              Stay Ahead with DIY Electronics & Project Tutorials
            </h3>
            <p className="text-xs text-gray-300 mb-6">
              Subscribe to get exclusive student discount coupons, newly released IoT kits, Arduino tutorials, and robotics project ideas delivered to your inbox.
            </p>

            {newsletterSubmitted ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-md text-xs font-semibold">
                ✓ Thank you for subscribing! Check your email for your WELCOMEVK 10% coupon code.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-2.5 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-6 py-2.5 rounded-md text-sm transition flex items-center justify-center space-x-1.5 shadow"
                >
                  <span>Subscribe</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
