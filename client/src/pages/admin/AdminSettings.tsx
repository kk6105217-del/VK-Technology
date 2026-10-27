import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';
import {
  Settings,
  Save,
  Truck,
  IndianRupee,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Info,
  QrCode,
  Upload,
  Image as ImageIcon,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'VK Technology',
    owner_name: 'Karthik Suroju',
    owner_email: 'admin@vktechnology.shop',
    business_phone: '+91 8555997052',
    business_address: 'India',
    currency_code: 'INR',
    currency_symbol: '₹',
    standard_shipping_fee: '60',
    free_shipping_threshold: '999',
    cod_available: 'true',
    cod_fee: '40',
    estimated_dispatch: '24-48 Business Hours',
    support_hours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',
    announcement_text: '🚚 Free delivery all across India on orders above ₹999!',
    owner_whatsapp_number: '+91 8555997052',
    upi_qr_enabled: 'true',
    upi_id: '8555997052@ibl',
    upi_payee_name: 'Mr Suroju Jnana Venkata Karthik',
    upi_qr_image_url: '/upi-qr-code.jpg'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'payments' | 'notifications' | 'security'>('store');

  // Admin Account & Password State
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('vk_admin_email') || 'admin@vktechnology.shop');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingCredentials, setUpdatingCredentials] = useState(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.settings.get();
        if (res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingQr(true);
      setError(null);
      const res = await api.upload.single(file);
      if (res.url) {
        handleChange('upi_qr_image_url', res.url);
        setSuccess('UPI QR code uploaded successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload QR code image.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await api.settings.update(settings);
      setSuccess('Store and shipping settings updated successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (adminPassword && adminPassword.length < 6) {
      setCredError('New admin password must be at least 6 characters long.');
      return;
    }

    if (adminPassword && adminPassword !== confirmPassword) {
      setCredError('New password and confirm password do not match.');
      return;
    }

    try {
      setUpdatingCredentials(true);
      const cleanEmail = (adminEmail.trim() || 'admin@vktechnology.shop').toLowerCase();
      await (api.auth as any).updateAdminCredentials({
        email: cleanEmail,
        password: adminPassword || undefined
      });
      handleChange('owner_email', cleanEmail);
      setCredSuccess(`Admin credentials updated successfully! You can now log in using ${cleanEmail}.`);
      setAdminPassword('');
      setConfirmPassword('');
      setTimeout(() => setCredSuccess(null), 6000);
    } catch (err: any) {
      setCredError(err.message || 'Failed to update admin credentials.');
    } finally {
      setUpdatingCredentials(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-amber-500" size={24} />
            Store & Business Configuration
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure shipping thresholds, Indian Rupee delivery fees, Cash on Delivery, and business contact info.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-5 py-2 rounded text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 font-bold">&times;</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-500 font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2 text-xs">
        <button
          onClick={() => setActiveTab('store')}
          className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'store'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MapPin size={15} /> Store & Contact
        </button>
        <button
          onClick={() => setActiveTab('shipping')}
          className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'shipping'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Truck size={15} /> Shipping & Delivery
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard size={15} /> Payment Gateways
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bell size={15} /> Order Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Lock size={15} /> Admin Account & Security
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-b-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading configuration...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-b-lg border-x border-b border-gray-200 shadow-sm text-xs">
          {/* TAB 1: STORE & CONTACT */}
          {activeTab === 'store' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.store_name || ''}
                    onChange={(e) => handleChange('store_name', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={settings.owner_name || ''}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Owner / Support Email</label>
                  <input
                    type="email"
                    value={settings.owner_email || ''}
                    onChange={(e) => handleChange('owner_email', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Order notifications will be sent to this email address.
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.business_phone || ''}
                    onChange={(e) => handleChange('business_phone', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Business & Shipping Origin</label>
                <textarea
                  rows={2}
                  value={settings.business_address || ''}
                  onChange={(e) => handleChange('business_address', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Primary business operating region displayed on customer invoices and receipts.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Store Announcement Bar Text</label>
                <input
                  type="text"
                  value={settings.announcement_text || ''}
                  onChange={(e) => handleChange('announcement_text', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Operating / Support Hours</label>
                <input
                  type="text"
                  value={settings.support_hours || ''}
                  onChange={(e) => handleChange('support_hours', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.standard_shipping_fee || '60'}
                    onChange={(e) => handleChange('standard_shipping_fee', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Standard courier charge applied when cart is under the free shipping minimum.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.free_shipping_threshold || '999'}
                    onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Orders with subtotal at or above this amount receive 100% free delivery across India.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={settings.cod_available === 'true'}
                    onChange={(e) => handleChange('cod_available', e.target.checked ? 'true' : 'false')}
                    className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                  />
                  <span className="font-bold text-gray-800">
                    Enable Cash on Delivery (COD) Payment
                  </span>
                </label>

                {settings.cod_available === 'true' && (
                  <div className="pl-6">
                    <label className="block font-semibold text-gray-700 mb-1">
                      Cash on Delivery Handling Surcharge (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.cod_fee || '40'}
                      onChange={(e) => handleChange('cod_fee', e.target.value)}
                      className="w-48 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Nominal convenience charge to discourage unverified COD cancellations (default ₹40).
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="block font-semibold text-gray-700 mb-1">Estimated Dispatch Time</label>
                <input
                  type="text"
                  value={settings.estimated_dispatch || '24-48 Business Hours'}
                  onChange={(e) => handleChange('estimated_dispatch', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT GATEWAYS */}
          {activeTab === 'payments' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg flex items-start gap-3">
                <Info size={18} className="shrink-0 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Razorpay Payment Gateway Integration</span>
                  <p className="text-[11px] leading-relaxed">
                    Razorpay enables Indian online payments including UPI (Google Pay, PhonePe, Paytm),
                    Credit & Debit cards, and Net Banking. Payment credentials must be securely stored in
                    <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-mono ml-1">server/.env</code>:
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-[11px] font-mono mt-2 overflow-x-auto">
RAZORPAY_KEY_ID=rzp_test_...&#10;RAZORPAY_KEY_SECRET=...
                  </pre>
                  <p className="text-[11px] text-blue-800 mt-1">
                    💡 If keys are left blank in development, the system automatically runs the integrated Sandbox Test Simulator so you can test complete end-to-end checkout flows without interruptions.
                  </p>
                </div>
              </div>

              {/* Dedicated UPI QR Code Section */}
              <div className="bg-white border-2 border-purple-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">Direct UPI QR Code Payment</h3>
                      <p className="text-[11px] text-gray-500">Allow customers to pay directly by scanning your PhonePe / GPay QR code.</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/upi-payments"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <span>View UPI Payments</span>
                  </Link>
                </div>

                {/* Enable toggle */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.upi_qr_enabled === 'true'}
                    onChange={(e) => handleChange('upi_qr_enabled', e.target.checked ? 'true' : 'false')}
                    className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                  />
                  <span className="font-bold text-gray-800">
                    Enable UPI QR Code Payment on Checkout Page
                  </span>
                </label>

                {/* QR Code Preview & Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Current QR Code Image
                    </label>
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-center flex flex-col items-center justify-center min-h-[180px]">
                      {settings.upi_qr_image_url ? (
                        <div className="space-y-2">
                          <img
                            src={settings.upi_qr_image_url}
                            alt="Active UPI QR Code"
                            className="max-h-48 max-w-full mx-auto object-contain rounded border shadow-sm bg-white p-1"
                          />
                          <p className="text-[10px] text-emerald-700 font-semibold">Active QR Code for Customers</p>
                        </div>
                      ) : (
                        <div className="text-gray-400 space-y-1">
                          <QrCode size={40} className="mx-auto text-gray-300" />
                          <p className="text-xs">No QR Code Image Uploaded</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-1.5 rounded cursor-pointer transition text-xs border border-gray-300">
                        <Upload size={14} />
                        <span>{uploadingQr ? 'Uploading...' : 'Replace QR Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          disabled={uploadingQr}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Business UPI ID *
                      </label>
                      <input
                        type="text"
                        value={settings.upi_id || ''}
                        onChange={(e) => handleChange('upi_id', e.target.value)}
                        placeholder="e.g. 8555997052@ibl"
                        className="w-full border border-gray-300 rounded px-3 py-2 font-mono font-bold text-gray-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Displayed to customers with a 1-click copy button.
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Payee / Business Name *
                      </label>
                      <input
                        type="text"
                        value={settings.upi_payee_name || ''}
                        onChange={(e) => handleChange('upi_payee_name', e.target.value)}
                        placeholder="e.g. Mr Suroju Jnana Venkata Karthik"
                        className="w-full border border-gray-300 rounded px-3 py-2 font-semibold text-gray-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Name shown in the UPI payment application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <h3 className="font-bold text-gray-900">Supported Customer Payment Methods:</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Direct PhonePe / GPay / Paytm UPI QR Code</li>
                  <li>Online Gateway (Razorpay UPI, Cards, Net Banking)</li>
                  <li>Cash on Delivery (Admin toggleable with optional surcharge)</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex items-start gap-3">
                <Bell size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Email & WhatsApp Order Notifications</span>
                  <p className="text-[11px] leading-relaxed">
                    Every confirmed order immediately sends an order confirmation to:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    <li><strong>Store Owner:</strong> <span className="font-mono text-amber-950">{settings.owner_email || 'admin@vktechnology.shop'}</span></li>
                    <li><strong>Customer:</strong> The email and phone number provided at checkout.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-900">Owner WhatsApp Order Alerts</h3>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Store Owner WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    value={settings.owner_whatsapp_number || '+91 8555997052'}
                    onChange={(e) => handleChange('owner_whatsapp_number', e.target.value)}
                    placeholder="+91 8555997052"
                    className="w-full sm:w-80 border border-gray-300 rounded px-3 py-2 font-mono font-bold text-gray-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Every order notification, customer payment reference, and fulfillment alert is dispatched to this verified WhatsApp number.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-900">Configuring Delivery Services:</h3>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  For automated email delivery, provide either your Resend API Key or SMTP credentials in <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">server/.env</code>:
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-[11px] font-mono overflow-x-auto">
RESEND_API_KEY=re_...&#10;# Or SMTP:&#10;SMTP_HOST=smtp.gmail.com&#10;SMTP_PORT=587&#10;SMTP_USER=...&#10;SMTP_PASS=...
                </pre>
                <p className="text-[11px] text-gray-600">
                  📱 WhatsApp Web fallback links (<code className="font-mono text-gray-800">api.whatsapp.com/send</code>) are automatically generated for all placed orders even if third-party WhatsApp Business API keys are not supplied.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN ACCOUNT & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              {/* Account Status Card */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>MASTER ADMINISTRATOR & OWNER ACCESS</span>
                </div>
                <div className="text-sm font-semibold">
                  Active Admin Account: <span className="font-mono text-cyan-300">{adminEmail || 'admin@vktechnology.shop'}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  You can update your owner login email and password below. Your changes will immediately update the administrative login credentials.
                </p>
              </div>

              {credSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{credSuccess}</span>
                </div>
              )}

              {credError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{credError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentials} className="space-y-5 bg-white p-5 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Lock size={16} className="text-amber-500" />
                  <span>Update Admin Login Credentials</span>
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Owner Admin Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@vktechnology.shop"
                      className="w-full px-3 py-2 pl-9 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-gray-900"
                    />
                    <Mail size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Used to authenticate at <code>/admin/login</code>. Default: <strong>admin@vktechnology.shop</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      New Admin Password
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Leave blank to keep unchanged"
                        className="w-full px-3 py-2 pl-9 pr-9 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <Key size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3 py-2 pl-9 pr-9 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <Key size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingCredentials}
                    className="bg-gray-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded text-xs flex items-center gap-2 shadow transition disabled:opacity-50"
                  >
                    <Save size={15} className="text-amber-400" />
                    <span>{updatingCredentials ? 'Saving Credentials...' : 'Save Admin Email & Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Save Button Bar */}
          <div className="pt-6 border-t mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold px-6 py-2.5 rounded text-xs flex items-center gap-1.5 shadow transition disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
