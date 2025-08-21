"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Package, Plus, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import HeaderTitlePage from "@/components/templates/HeaderTitlePage";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { ProductModal } from "./partials/form";
import { EditProductModal } from "./partials/edit-form";
import { DetailProductModal } from "./partials/detail-form";
import { ProductBulkUpload } from "@/components/molecules/Product/ProductBulkUpload";
import { Product } from "@/schemas/products/products";

import { productApi } from "@/utils/apis/product";
import { ProductsResponse } from "@/schemas/initiateSetup/product";
import { useToast } from "@/components/atoms/ToastProvider";
import ActionDropdown from "@/components/molecules/ActionDropdown";
import Swal from "sweetalert2";

export default function ProductsPage() {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const fetchProducts = useCallback(
    async (page: number = 1): Promise<void> => {
      setIsLoading(true);
      try {
        const result = (await productApi.getAll({
          page,
          perPage: pageSize,
        })) as ProductsResponse;

        const productsArray = result?.data?.products;

        if (
          result &&
          result.status === "success" &&
          Array.isArray(productsArray)
        ) {
          const products: Product[] = productsArray.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image || null,
            price: product.price,
            categoryId: product.categoryId,
            category: product.category || "Uncategorized",
            shipping: product.shipping,
            weight: product.weight ?? product.shipping?.weight,
            volume: product.volume ?? product.shipping?.volume,
            stock: product.stock ?? 0,
            reservedStock: product.reservedStock,
            type: product.type,
            sequence: product.sequence,
            active: product.active,
            status: product.active ? "active" : "inactive",
            sku: product.sku || `SKU-${product.id.slice(-6)}`,
            organizationId: product.organizationId,
            branchId: product.branchId,
            createdBy: product.createdBy,
            updatedBy: product.updatedBy,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            variants: product.variants,
          }));

          const { totalItems } = result.meta.pagination;
          setProducts(products);
          setTotalItems(totalItems);
        } else {
          console.warn(
            "[ProductsPage] No products returned (data kosong atau bukan array)",
            result.data
          );
          setProducts([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("[ProductsPage] Failed to fetch products:", error);
        showToast("Gagal mengambil data produk", "error");
        setProducts([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, showToast]
  );

  // Handler untuk ketika produk berhasil ditambahkan
  const handleAddProductSuccess = useCallback(async () => {
    // Reset to first page when adding new product
    setPageIndex(0);
    await fetchProducts(1);
  }, [fetchProducts]);

  const handleAddProduct = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    setIsEditModalOpen(false);
    setEditProduct(null);
    const currentPage = pageIndex + 1;
    await fetchProducts(currentPage);
  }, [fetchProducts, pageIndex]);

  const handleDelete = useCallback(
    async (product: Product) => {
      const result = await Swal.fire({
        title: `Delete "${product.name}"?`,
        text: "Are you sure you want to delete this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const deleteResult = await productApi.delete(product.id);

          if ((deleteResult as { code?: number })?.code === 200) {
            showToast("Product deleted successfully", "success");

            const remainingItems = totalItems - 1;
            const maxPage = Math.ceil(remainingItems / pageSize);
            const targetPage =
              pageIndex + 1 > maxPage ? Math.max(1, maxPage) : pageIndex + 1;

            if (targetPage !== pageIndex + 1) {
              setPageIndex(targetPage - 1);
            }

            await fetchProducts(targetPage);
          } else {
            showToast("Failed to delete product", "error");
          }
        } catch (error) {
          console.error("Failed to delete product:", error);
          showToast("Failed to delete product", "error");
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchProducts, pageIndex, pageSize, showToast, totalItems]
  );

  const handleView = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (selectedProduct) {
      setIsDetailModalOpen(false);
      setEditProduct(selectedProduct);
      setIsEditModalOpen(true);
    }
  }, [selectedProduct]);

  // Handle search with debounce
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setPageIndex(0); // Reset to first page on search
      await fetchProducts(1);
    },
    [fetchProducts]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handlePageChange = useCallback(
    async (newPageIndex: number) => {
      setPageIndex(newPageIndex);
      await fetchProducts(newPageIndex + 1);
    },
    [fetchProducts]
  );

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-[#232336] rounded-lg flex items-center justify-center">
            {row.original.image ? (
              <Image
                src={
                  Array.isArray(row.original.image)
                    ? row.original.image[0]
                    : row.original.image
                }
                alt={row.original.name}
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Package
              className={`w-5 h-5 text-gray-400 dark:text-gray-500 ${
                row.original.image ? "hidden" : ""
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.sku || `SKU-${String(row.original.id).slice(-6)}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ getValue }) => {
        const stock = (getValue() as number) || 0;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              stock > 10
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : stock > 0
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {stock} unit
          </span>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) => (
        <span className="font-semibold text-gray-900  dark:text-gray-100">
          {formatPrice(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        const categoryName =
          typeof category === "string"
            ? category
            : category?.name || "Uncategorized";
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-[#232336] text-gray-700 dark:text-gray-300 rounded text-sm">
            {categoryName}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              value === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {value === "active" ? "Aktif" : "Tidak Aktif"}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-left">
          <ActionDropdown<Product>
            item={row.original}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ),
    },
  ];

  const totalProducts = totalItems;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const inactiveProducts = products.filter(
    (p) => p.status === "inactive"
  ).length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5).length;

  return (
    <>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
        onSuccess={handleAddProductSuccess}
      />

      <DetailProductModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onEdit={handleDetailEdit}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
        onSubmit={handleEditSubmit}
      />

      <HeaderTitlePage
        title="Products"
        description="Manage your product inventory here. You can add new products, edit existing ones, track stock levels, and organize products by categories. Keep your product catalog up to date to provide the best shopping experience for your customers."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <WidgetHeader
          variant="primary"
          title="Total Products"
          value={String(totalProducts)}
          icon={<Package className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Active Products"
          value={String(activeProducts)}
          icon={<Package className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Inactive Products"
          value={String(inactiveProducts)}
          icon={<Package className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Low Stock Alert"
          value={String(lowStockProducts)}
          icon={<Package className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
      </div>

      <div className="p-10 rounded-2xl bg-white dark:bg-[#161618]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-10"
              onClick={() => alert("Filter products")}
              disabled={isLoading}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search products..."
              className="w-64 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <ProductBulkUpload onSuccess={fetchProducts} />
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 h-10"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="size-4" />
              Add Product
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          total={totalItems}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
