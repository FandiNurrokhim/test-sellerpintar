import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  sku: z.string().min(1, "SKU is required."),
  price: z.number({ invalid_type_error: "Price must be a number." }).min(0),
  stock: z.number({ invalid_type_error: "Stock must be a number." }).min(0),
  categoryId: z.string().min(1, "Category is required."),
  shipping: z.object({
    weight: z.number({ invalid_type_error: "Weight must be a number." }),
    volume: z.number({ invalid_type_error: "Volume must be a number." }),
  }),
  image: z
    .array(z.string().min(1, "Image URL is required"))
    .min(1, "At least one image is required"),
  type: z.string().optional().default("product"),
  sequence: z.number().optional().default(1),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required."),
        price: z
          .number({ invalid_type_error: "Price must be a number." })
          .min(0),
        stock: z
          .number({ invalid_type_error: "Stock must be a number." })
          .min(0),
        sku: z.string().min(1, "Variant SKU is required."),
        image: z.array(z.string()).default([]),
        description: z.string().default(""),
      })
    )
    .default([]),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  description: z.string().min(1, "Description is required."),
  sku: z.string().min(1, "SKU is required."),
  image: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  price: z
    .number({ invalid_type_error: "Price must be a number." })
    .min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required."),
  shipping: z.object({
    weight: z
      .number({ invalid_type_error: "Weight must be a number." })
      .min(0, "Weight must be positive"),
    volume: z
      .number({ invalid_type_error: "Volume must be a number." })
      .min(0, "Volume must be positive"),
  }),
  stock: z
    .number({ invalid_type_error: "Stock must be a number." })
    .min(0, "Stock must be non-negative"),
  type: z.string().optional().default("product"),
  sequence: z.number().optional().default(1),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required."),
        price: z
          .number({ invalid_type_error: "Price must be a number." })
          .min(0, "Price must be positive"),
        stock: z
          .number({ invalid_type_error: "Stock must be a number." })
          .min(0, "Stock must be non-negative"),
        sku: z.string().min(1, "Variant SKU is required."),
        image: z
          .array(z.string().url("Invalid image URL"))
          .min(1, "At least one image is required for variant"),
        description: z.string().min(1, "Variant description is required."),
      })
    )
    .min(1, "At least one variant is required"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export type Product = {
  id: string;
  name: string;
  title?: string;
  description: string;
  image: string | string[] | null;
  price: number;
  categoryId?: string;
  category?: Category | string;
  shipping?: {
    weight: number;
    volume: number;
  };
  weight?: number;
  volume?: number;
  stock: number;
  reservedStock?: number;
  type?: string;
  sequence?: number;
  active?: boolean;
  status: "active" | "inactive";
  sku?: string;
  organizationId?: string;
  branchId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
};

export type ProductsResponse = {
  status: string;
  code: number;
  message: string;
  data: {
    products: {
      id: string;
      name: string;
      description: string;
      price: number;
      createdBy: string;
      updatedBy: string;
      createdAt: string;
      updatedAt: string;
      image?: string | string[];
      categoryId?: string;
      category?: string | Category;
      shipping?: {
        weight: number;
        volume: number;
      };
      weight?: number;
      volume?: number;
      stock?: number;
      reservedStock?: number;
      type?: string;
      sequence?: number;
      active?: boolean;
      sku?: string;
      organizationId?: string;
      branchId?: string;
      variants?: ProductVariant[];
    }[];
  };
  meta: {
    pagination: {
      totalItems: number;
      currentPage: number;
      perPage: number;
      totalPages: number;
    };
  };
};

export type ProductResponse = {
  status?: string;
  message: string;
  data: {
    product?: Product;
    id?: string;
    name?: string;
    description?: string;
    image?: string[];
    price?: number;
    categoryId?: string;
    shipping?: {
      weight: number;
      volume: number;
    };
    stock?: number;
    type?: string;
    sequence?: number;
    active?: boolean;
    organizationId?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    branchId?: string;
    variants?: ProductVariant[];
    category?: Category | string;
  };
};

export type Category = {
  id: string;
  name: string;
  sequence?: number;
  status: "active" | "inactive";
  active?: boolean;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  branchId?: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  title?: string;
  price: number;
  stock: number;
  sku?: string;
  image?: string[];
  reservedStock?: number;
  organizationId?: string;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  description?: string;
};

export type ProductCreateResult = {
  status: string;
  code: number;
  message: string;
  data: {
    product: {
      variants: ProductVariant[];
    };
  };
};
