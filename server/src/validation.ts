import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().optional(),
  sku: z.string().min(2, 'SKU is required'),
  category_id: z.coerce.number().int().positive('Valid category ID is required'),
  subcategory: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  regular_price: z.coerce.number().positive('Regular price must be greater than 0'),
  discounted_price: z.coerce.number().positive().optional().nullable(),
  stock_quantity: z.coerce.number().int().nonnegative('Stock quantity must be 0 or more').default(0),
  brand: z.string().default('VK Technology'),
  specifications: z.record(z.string(), z.any()).optional().default({}),
  features: z.array(z.string()).optional().default([]),
  compatibility: z.string().optional().nullable(),
  package_contents: z.array(z.string()).optional().default([]),
  shipping_weight_grams: z.coerce.number().int().positive().default(250),
  estimated_dispatch_days: z.coerce.number().int().positive().default(1),
  warranty_info: z.string().default('6 Months Manufacturer Warranty'),
  is_featured: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  images: z.array(z.string()).optional().default([])
});

export const productUpdateSchema = productSchema.partial();

export const customerRegisterSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable()
});

export const customerLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  address_line1: z.string().min(5, 'Address line 1 is required'),
  address_line2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  is_default: z.boolean().optional().default(false)
});

export const orderCreateSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  shipping_address: z.any(),
  payment_method: z.enum(['razorpay', 'cod', 'upi_qr']),
  coupon_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().positive(),
      variant_id: z.coerce.number().int().optional()
    })
  ).min(1, 'Order must contain at least 1 item')
});

export const reviewSchema = z.object({
  customer_name: z.string().min(2),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  comment: z.string().min(5, 'Review comment must be at least 5 characters')
});
