import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required."),
  sku: z.string().min(1, "SKU is required."),
  description: z.string().min(1, "Description is required."),
  category: z.string().min(1, "Category is required."),
  weight: z.number({ invalid_type_error: "Weight must be a number." }),
  volume: z.number({ invalid_type_error: "Volume must be a number." }),
  image: z
    .array(z.object({ url: z.string().nonempty("Image URL is required") }))
    .min(1, "At least one image is required"),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Variant title is required."),
        price: z
          .number({ invalid_type_error: "Price must be a number." })
          .min(0),
        stock: z
          .number({ invalid_type_error: "Stock must be a number." })
          .min(0),
        sku: z.string().min(1, "Variant SKU is required."),
        description: z.string().optional(),
        image: z.array(z.string()).optional(),
      })
    )
    .min(1, "At least one variant is required"),
});

export type Product = {
  id: string;
  name: string;
  description: string;
  image: string | string[] | null;
  price: number;
  categoryId?: string;
  category?: string | Category;
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
  message: string;
  data: {
    id: string;
    name: string;
    sku: string;
    description: string;
    image: string[];
    price: number;
    categoryId: string;
    shipping: {
      weight: number;
      volume: number;
    };
    stock: number;
    type: string;
    sequence: number;
    active: boolean;
    organizationId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    branchId: string;
    variants: ProductVariant[];
    category: Category | string;
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
  sku: string;
  price: number;
  stock: number;
  reservedStock: number;
  organizationId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  description?: string;
  image?: string[];
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

export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductPayload {
  name: string;
  sku: string;
  description: string;
  image: string[];
  price: number;
  categoryId: string;
  shipping: {
    weight: number;
    volume: number;
  };
  stock: number;
  type: string;
  sequence: number;
  variants: {
    id?: string;
    name: string;
    price: number;
    stock: number;
    sku: string;
    description?: string;
    image?: string[];
  }[];
}
