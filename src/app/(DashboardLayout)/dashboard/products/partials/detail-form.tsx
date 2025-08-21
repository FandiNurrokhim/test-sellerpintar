import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import { ImageFileUploadField } from "@/components/templates/Forms/ImageFileUploadField";
import { Product } from "@/schemas/products/products";
import { productApi } from "@/utils/apis/product";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { ImageItem } from "@/types/upload";

interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryData {
  id?: string;
  _id?: string;
  value?: string;
  name?: string;
  label?: string;
  title?: string;
  active?: boolean;
}

interface CategoryResponse {
  data?: {
    categories?: CategoryData[];
  };
}

interface DetailProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: () => void;
}

export const DetailProductModal: React.FC<DetailProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onEdit,
}) => {
  const { data: session } = useSession();
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [productImages, setProductImages] = useState<ImageItem[]>([]);

  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;
  if (branchId) headers["x-branch-id"] = branchId;

  useEffect(() => {
    if (product) {
      const images = Array.isArray(product.image)
        ? product.image
        : product.image
        ? [product.image]
        : [];

      const imageItems: ImageItem[] =
        images.length > 0 ? images.map((url) => ({ url })) : [];

      setProductImages(imageItems);
    } else {
      setProductImages([]);
    }
  }, [product]);

  const fetchCategories = useCallback(async () => {
    if (!isOpen) return;

    setLoadingCategories(true);
    try {
      const result = (await productApi.getCategories(
        true,
        {}
      )) as CategoryResponse;
      let categoriesData: CategoryData[] = [];

      if (result?.data?.categories && Array.isArray(result.data.categories)) {
        categoriesData = result.data.categories;
      }

      if (!Array.isArray(categoriesData)) {
        console.warn("Categories data is not an array:", categoriesData);
        categoriesData = [];
      }

      const categoryOptions: CategoryOption[] = categoriesData
        .filter((cat: CategoryData) => cat && cat.active !== false)
        .map((cat: CategoryData) => ({
          value: cat.id || cat._id || cat.value || "",
          label: cat.name || cat.label || cat.title || "",
        }));

      setCategories(categoryOptions);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryName = (
    categoryData: string | { name?: string; label?: string } | null | undefined
  ): string => {
    if (!categoryData) return "Uncategorized";

    if (typeof categoryData === "string") {
      const foundCategory = categories.find(
        (cat) => cat.value === categoryData
      );
      return foundCategory?.label || categoryData;
    }

    if (typeof categoryData === "object") {
      return categoryData.name || categoryData.label || "Uncategorized";
    }

    return "Uncategorized";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const handleImageFileChange = async (): Promise<void> => {
    return Promise.resolve();
  };

  const handleRemoveImage = (): void => {};

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="border-b border-gray-200 mb-4">
        <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
          Product Details
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          View detailed information about this product.
        </p>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                Product Name
              </Label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {product?.name || "-"}
              </p>
            </div>

            <div>
              <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                Description
              </Label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {product?.description || "-"}
              </p>
            </div>

            <div>
              <Label
                className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60"
                tooltip="Stock Keeping Unit (SKU) is a unique identifier for each distinct product and service that can be purchased."
              >
                SKU
              </Label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {product?.sku || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                  Price
                </Label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {product?.price ? formatPrice(product.price) : "-"}
                </p>
              </div>

              <div>
                <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                  Stock
                </Label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {product?.stock ?? "-"}
                </p>
              </div>
            </div>

            <div>
              <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                Category
              </Label>
              {loadingCategories ? (
                <div className="mt-1 bg-gray-50 px-3 py-2 rounded-md flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="text-sm text-gray-500">
                    Loading category...
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {product?.category
                    ? getCategoryName(product.category)
                    : "Uncategorized"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                  Type
                </Label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md capitalize">
                  {product?.type || "product"}
                </p>
              </div>

              <div>
                <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                  Sequence
                </Label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                  {product?.sequence ?? 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {productImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white/80">
              Product Images
            </h3>
            <div className="space-y-3">
              {productImages.map((image, index) => (
                <ImageFileUploadField
                  key={index}
                  image={image}
                  index={index}
                  onFileChange={handleImageFileChange}
                  onRemove={handleRemoveImage}
                  canRemove={false}
                  viewOnly={true}
                  label={`Product Image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Shipping Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            Shipping Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                Weight (gram)
              </Label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {product?.shipping?.weight || "-"}
              </p>
            </div>

            <div>
              <Label className="!font-sentient text-sm font-medium text-gray-700 dark:text-white/60">
                Volume (cm³)
              </Label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-3 py-2 rounded-md">
                {product?.shipping?.volume || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        {product?.variants && product.variants.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white/80">
              Product Variants
            </h3>

            {product.variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="border rounded-lg p-4 space-y-3"
              >
                <h4 className="font-medium text-gray-800 dark:text-white/80">
                  {variant.name || `Variant ${variantIndex + 1}`}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      SKU
                    </Label>
                    <p className="text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-2 py-1 rounded">
                      {variant.sku || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Price
                    </Label>
                    <p className="text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-2 py-1 rounded">
                      {formatPrice(variant.price)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    Stock
                  </Label>
                  <p className="text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-2 py-1 rounded">
                    {variant.stock}
                  </p>
                </div>

                {variant.description && (
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      Description
                    </Label>
                    <p className="text-sm text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white/90 px-2 py-1 rounded">
                      {variant.description}
                    </p>
                  </div>
                )}

                {/* Variant Images using ImageFileUploadField */}
                {variant.image &&
                  Array.isArray(variant.image) &&
                  variant.image.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-600">
                        Variant Images
                      </Label>
                      <div className="space-y-2">
                        {variant.image.map(
                          (imageUrl: string, imgIndex: number) => (
                            <ImageFileUploadField
                              key={imgIndex}
                              image={{ url: imageUrl }}
                              index={imgIndex}
                              onFileChange={handleImageFileChange}
                              onRemove={handleRemoveImage}
                              canRemove={false} // Disable remove in view mode
                              viewOnly={true} // Enable view-only mode
                              label={`Variant Image ${imgIndex + 1}`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
        <Button variant="ghost" type="button" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button type="button" onClick={onEdit}>
            Edit Product
          </Button>
        )}
      </div>
    </ModalSide>
  );
};
