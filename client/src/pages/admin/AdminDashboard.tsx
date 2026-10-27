import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import { getOrderStatusBadge } from '../OrdersPage';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.settings.getAdminStats();
      setData(res);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentOrders = [], bestSellers = [], dailySales = [] } = data;

  return (
    <div className="space-y-6 text-left">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Performance Overview</h1>
          <p className="text-xs text-gray-500">
            Real-time sales, order fulfillment, and inventory analytics for VK Technology.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Link
            to="/admin/products"
            className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-4 py-2 rounded shadow transition"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Sales Revenue</span>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              ₹{Number(stats.total_sales || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              Direct Bank / UPI & COD Revenue
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <span className="text-xl">₹</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</span>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {stats.total_orders || 0}
            </div>
            <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
              {stats.completed_orders || 0} Delivered successfully
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending Fulfillment</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.pending_orders || 0}
            </div>
            <Link to="/admin/orders" className="text-[11px] text-amber-700 hover:underline font-semibold mt-1 block">
              Process pending packages →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        {/* Total Products & Low Stock */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Catalog</span>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {stats.total_products || 0} Products
            </div>
            {stats.low_stock_products > 0 ? (
              <span className="text-[11px] text-red-600 font-bold mt-1 block">
                ⚠️ {stats.low_stock_products} items low on stock
              </span>
            ) : (
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                0 items low on stock • Inventory healthy
              </span>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Daily Sales Chart Summary (CSS Bar Chart) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <TrendingUp size={16} className="text-amber-500" />
              <span>Revenue Trend (Past 14 Days)</span>
            </h2>
            <p className="text-xs text-gray-500">Daily sales volume across all Indian delivery zones.</p>
          </div>
          <Link to="/admin/reports" className="text-xs text-vk-blue hover:underline font-semibold">
            View detailed sales report
          </Link>
        </div>

        {dailySales.length > 0 ? (
          <div className="h-44 flex items-end space-x-2 pt-6 pb-2 border-b border-gray-200 overflow-x-auto">
            {dailySales.map((d: any, idx: number) => {
              const maxRev = Math.max(...dailySales.map((s: any) => s.total_revenue || 1));
              const heightPct = Math.max(15, Math.round((d.total_revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center min-w-[36px] group">
                  <div className="text-[9px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ₹{d.total_revenue}
                  </div>
                  <div
                    className="w-full bg-amber-400 group-hover:bg-amber-500 rounded-t transition-all shadow-sm"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[40px]">
                    {d.sale_date?.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 italic">
            Sales data will display here automatically as customers place orders.
          </div>
        )}
      </div>

      {/* Grid: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs text-vk-blue hover:underline font-semibold flex items-center">
              <span>View all orders</span>
              <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center italic">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2">Order #</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-mono font-bold text-gray-900">
                        {ord.order_number}
                      </td>
                      <td className="py-2.5 text-gray-700">{ord.customer_name}</td>
                      <td className="py-2.5 font-bold text-gray-900">
                        ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5">
                        {getOrderStatusBadge(ord.order_status)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/orders/${ord.id}`}
                          target="_blank"
                          className="text-vk-blue hover:underline font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Best Sellers (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            Top Performing Products
          </h2>

          <div className="divide-y divide-gray-100 text-xs">
            {bestSellers.map((p: any) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 truncate">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&q=80'}
                    alt={p.name}
                    className="w-9 h-9 object-contain bg-gray-50 rounded border p-0.5 shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-gray-800 block truncate">{p.name}</span>
                    <span className="text-[10px] text-gray-500">Stock: {p.stock_quantity} left</span>
                  </div>
                </div>
                <strong className="text-gray-900 shrink-0">
                  ₹{p.discounted_price || p.regular_price}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
