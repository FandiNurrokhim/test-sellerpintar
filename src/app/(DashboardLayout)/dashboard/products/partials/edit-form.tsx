import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { ImageFileUploadField } from "@/components/templates/Forms/ImageFileUploadField";
import { Trash2, Plus } from "lucide-react";
import {
  ProductFormData,
  productFormSchema,
  Product,
} from "@/schemas/products/products";

import { productApi } from "@/utils/apis/product";
import { repository } from "@/utils/apis/repository";
import { useToast } from "@/components/atoms/ToastProvider";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { Category, CategoryApiResponse } from "@/types/category";
import { ApiError } from "@/types/api";
import { UploadResponse, ImageItem } from "@/types/upload";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  onSuccess?: () => void;
  product: Product | null;
}

interface VariantWithId {
  id?: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  image: ImageItem[];
  description: string;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  product,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useZodForm(productFormSchema);

  const { data: session } = useSession();
  const { showToast } = useToast();
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const [categories, setCategories] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([{ url: "" }]);
  const [variants, setVariants] = useState<VariantWithId[]>([
    {
      name: "",
      price: 0,
      stock: 0,
      sku: "",
      image: [{ url: "" }] as ImageItem[],
      description: "",
    },
  ]);

  const headers = useMemo(() => {
    const headerObj: Record<string, string> = {};
    const token = session?.user.accessToken;
    if (organizationId) headerObj["x-organization-id"] = organizationId;
    if (branchId) headerObj["x-branch-id"] = branchId;
    if (token) headerObj["Authorization"] = `Bearer ${token}`;
    return headerObj;
  }, [organizationId, branchId, session?.user.accessToken]);

  const getInitialCategoryValue = (productData: Product) => {
    if (!productData) return "";

    if (productData.category) {
      if (typeof productData.category === "string") {
        return productData.category;
      }
      if (
        typeof productData.category === "object" &&
        "id" in productData.category
      ) {
        return productData.category.id;
      }
    }

    return "";
  };

  useEffect(() => {
    setValue(
      "image",
      images.filter((img) => img.url.trim() !== "").map((img) => img.url)
    );
  }, [images, setValue]);

  useEffect(() => {
    setValue(
      "variants",
      variants
        .filter((variant) => variant.name.trim() !== "")
        .map((variant) => ({
          ...variant,
          image: variant.image
            .filter((img) => img.url.trim() !== "")
            .map((img) => img.url),
        }))
    );
  }, [variants, setValue]);

  useEffect(() => {
    if (product && isOpen && categories.length > 0) {
      setValue("name", product.name);
      setValue("description", product.description);
      setValue("sku", product.sku || "");
      setValue("price", product.price);
      setValue("stock", product.stock);
      setValue("type", product.type || "product");
      setValue("sequence", product.sequence || 1);

      const categoryValue = getInitialCategoryValue(product);
      if (categoryValue) {
        setValue("categoryId", categoryValue);
      }

      if (product.shipping) {
        setValue("shipping.weight", product.shipping.weight);
        setValue("shipping.volume", product.shipping.volume);
      }

      const productImages = Array.isArray(product.image)
        ? product.image
        : product.image
        ? [product.image]
        : [];

      const imageItems: ImageItem[] =
        productImages.length > 0
          ? productImages.map((url) => ({ url }))
          : [{ url: "" }];

      setImages(imageItems);

      if (product.variants && product.variants.length > 0) {
        const formattedVariants: VariantWithId[] = product.variants.map(
          (variant) => ({
            id: variant.id,
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku || "",
            image:
              variant.image && Array.isArray(variant.image)
                ? variant.image.map((url: string) => ({ url }))
                : [{ url: "" }],
            description: variant.description || "",
          })
        );
        setVariants(formattedVariants);
      } else {
        setVariants([
          {
            name: "",
            price: 0,
            stock: 0,
            sku: "",
            image: [{ url: "" }],
            description: "",
          },
        ]);
      }
    }
  }, [product, isOpen, setValue, categories]);

  const fetchCategories = useCallback(async () => {
    if (!isOpen) return;

    setLoadingCategories(true);
    try {
      const result = (await productApi.getCategories(
        true,
        {},
        headers
      )) as CategoryApiResponse;

      let categoriesData: Category[] = [];

      if (result?.data?.categories && Array.isArray(result.data.categories)) {
        categoriesData = result.data.categories;
      }

      if (!Array.isArray(categoriesData)) {
        console.warn("Categories data is not an array:", categoriesData);
        categoriesData = [];
      }

      const categoryOptions = categoriesData
        .filter((cat: Category) => cat && cat.active !== false)
        .map((cat: Category) => ({
          value: cat.id || cat._id || cat.value || "",
          label: cat.name || cat.label || cat.title || "",
        }));

      setCategories(categoryOptions);

      if (product && categoryOptions.length > 0) {
        const categoryValue = getInitialCategoryValue(product);
        if (categoryValue) {
          setValue("categoryId", categoryValue);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      showToast("Failed to load categories", "error");
    } finally {
      setLoadingCategories(false);
    }
  }, [isOpen, product, setValue, showToast, headers]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const uploadFile = async (
    file: File,
    category: string = "product"
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("isPublic", "true");
    formData.append("description", `${category} image`);
    formData.append("altText", `${category} image`);

    try {
      const result: UploadResponse = (await repository.uploadSingleImageFile(
        true,
        {
          method: "POST",
          body: formData,
        },
        headers
      )) as UploadResponse;

      return result.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleImageFileChange = async (
    index: number,
    file: File
  ): Promise<void> => {
    const newImages = [...images];
    newImages[index] = { url: "", file, isUploading: true };
    setImages(newImages);

    try {
      const uploadedUrl = await uploadFile(file, "product");
      newImages[index] = { url: uploadedUrl, isUploading: false };
      setImages([...newImages]);
      showToast("Image uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      newImages[index] = { url: "", isUploading: false };
      setImages([...newImages]);
      showToast("Failed to upload image", "error");
    }
  };

  const addImageField = (): void => {
    setImages([...images, { url: "" }]);
  };

  const removeImageField = (index: number): void => {
    if (images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    }
  };

  const handleVariantChange = (
    index: number,
    field: string,
    value: string | number
  ): void => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleVariantImageFileChange = async (
    variantIndex: number,
    imageIndex: number,
    file: File
  ): Promise<void> => {
    const newVariants = [...variants];
    const newImages = [...newVariants[variantIndex].image];
    newImages[imageIndex] = { url: "", file, isUploading: true };
    newVariants[variantIndex].image = newImages;
    setVariants([...newVariants]);

    try {
      const uploadedUrl = await uploadFile(file, "product");
      newImages[imageIndex] = { url: uploadedUrl, isUploading: false };
      newVariants[variantIndex].image = newImages;
      setVariants([...newVariants]);
      showToast("Variant image uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading variant image:", error);
      newImages[imageIndex] = { url: "", isUploading: false };
      newVariants[variantIndex].image = newImages;
      setVariants([...newVariants]);
      showToast("Failed to upload variant image", "error");
    }
  };

  const addVariantImageField = (variantIndex: number): void => {
    const newVariants = [...variants];
    newVariants[variantIndex].image.push({ url: "" });
    setVariants(newVariants);
  };

  const removeVariantImageField = (
    variantIndex: number,
    imageIndex: number
  ): void => {
    const newVariants = [...variants];
    if (newVariants[variantIndex].image.length > 1) {
      newVariants[variantIndex].image = newVariants[variantIndex].image.filter(
        (_, i) => i !== imageIndex
      );
      setVariants(newVariants);
    }
  };

  const addVariant = (): void => {
    const newVariant: VariantWithId = {
      name: "",
      price: 0,
      stock: 0,
      sku: "",
      image: [{ url: "" }],
      description: "",
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index: number): void => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  const onFormSubmit = async (data: ProductFormData): Promise<void> => {
    if (!product?.id) return;

    try {
      const filteredImages = images
        .filter((img) => img.url.trim() !== "")
        .map((img) => img.url);

      const filteredVariants = variants
        .filter((variant) => variant.name.trim() !== "")
        .map((variant) => ({
          ...(variant.id && { id: variant.id }),
          name: variant.name.trim(),
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku.trim(),
          image: variant.image
            .filter((img) => img.url.trim() !== "")
            .map((img) => img.url),
          description: variant.description.trim(),
        }));

      const cleanData: ProductFormData & {
        variants: Array<{
          id?: string;
          name: string;
          price: number;
          stock: number;
          sku: string;
          image: string[];
          description: string;
        }>;
      } = {
        name: data.name.trim(),
        description: data.description.trim(),
        sku: data.sku.trim(),
        image: filteredImages,
        price: data.price,
        categoryId: data.categoryId,
        shipping: {
          weight: data.shipping.weight,
          volume: data.shipping.volume,
        },
        stock: data.stock,
        type: data.type || "product",
        sequence: data.sequence || 1,
        variants: filteredVariants,
      };

      await productApi.update(product.id, cleanData, true, {}, headers);
      showToast("Product updated successfully", "success");

      if (onSuccess) {
        onSuccess();
      }

      onSubmit(cleanData);
      onClose();
    } catch (error: unknown) {
      console.error("Error updating product:", error);

      let errorMessage = "Failed to update product";
      const apiError = error as ApiError;

      if (apiError?.message) {
        errorMessage = apiError.message;
      } else if (apiError?.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }

      showToast(errorMessage, "error");
    }
  };

  const resetForm = (): void => {
    reset();
    setImages([{ url: "" }]);
    setVariants([
      {
        name: "",
        price: 0,
        stock: 0,
        sku: "",
        image: [{ url: "" }],
        description: "",
      },
    ]);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  return (
    <ModalSide isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4">
          <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
            Edit Product
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Update the product details below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto space-y-6 pr-4"
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white/80">
              Basic Information
            </h3>

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter product name"
                  className="w-full"
                  required
                />
              }
              error={errors.name}
            />

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Enter product description"
                  className="w-full"
                  required
                />
              }
              error={errors.description}
            />

            <FormField
              label={
                <Label
                  className="!font-sentient"
                  htmlFor="sku"
                  tooltip="Stock Keeping Unit (SKU) is a unique identifier for each distinct product and service that can be purchased."
                >
                  SKU <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="Enter SKU"
                  className="w-full"
                  required
                />
              }
              error={errors.sku}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={
                  <Label className="!font-sentient" htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                }
                input={
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="Enter price"
                    className="w-full"
                    required
                  />
                }
                error={errors.price}
              />

              <FormField
                label={
                  <Label className="!font-sentient" htmlFor="stock">
                    Stock <span className="text-red-500">*</span>
                  </Label>
                }
                input={
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    placeholder="Enter stock"
                    className="w-full"
                    required
                  />
                }
                error={errors.stock}
              />
            </div>

            <FormField
              label={
                <Label className="!font-sentient" htmlFor="categoryId">
                  Category <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <SelectSearch
                  value={watch("categoryId") || ""}
                  onChange={(value: string) => setValue("categoryId", value)}
                  options={categories}
                  placeholder={
                    loadingCategories
                      ? "Loading categories..."
                      : "Select category"
                  }
                />
              }
              error={errors.categoryId}
            />
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white/80">
                Product Images <span className="text-red-500">*</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageField}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </Button>
            </div>

            {images.map((image, index) => (
              <ImageFileUploadField
                key={index}
                image={image}
                index={index}
                onFileChange={(index: number, file: File) =>
                  handleImageFileChange(index, file)
                }
                onRemove={() => removeImageField(index)}
                canRemove={images.length > 1}
              />
            ))}
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image.message}</p>
            )}
          </div>

          {/* Shipping Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white/80">
              Shipping Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={
                  <Label className="!font-sentient" htmlFor="weight">
                    Weight (gram) <span className="text-red-500">*</span>
                  </Label>
                }
                input={
                  <Input
                    id="weight"
                    type="number"
                    {...register("shipping.weight", { valueAsNumber: true })}
                    placeholder="Enter weight"
                    className="w-full"
                    required
                  />
                }
                error={errors.shipping?.weight}
              />

              <FormField
                label={
                  <Label className="!font-sentient" htmlFor="volume">
                    Volume (cm³) <span className="text-red-500">*</span>
                  </Label>
                }
                input={
                  <Input
                    id="volume"
                    type="number"
                    {...register("shipping.volume", { valueAsNumber: true })}
                    placeholder="Enter volume"
                    className="w-full"
                    required
                  />
                }
                error={errors.shipping?.volume}
              />
            </div>
          </div>

          {/* Product Variants */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white/80">
                Product Variants
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, variantIndex) => (
              <div
                key={variant.id || variantIndex}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800 dark:text-white/80">
                    Variant {variantIndex + 1}
                  </h4>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(variantIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      className="!font-sentient"
                      htmlFor={`variant-name-${variantIndex}`}
                    >
                      Variant Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`variant-name-${variantIndex}`}
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Variant name"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      className="!font-sentient"
                      htmlFor={`variant-sku-${variantIndex}`}
                    >
                      Variant SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`variant-sku-${variantIndex}`}
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(variantIndex, "sku", e.target.value)
                      }
                      placeholder="Variant SKU"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      className="!font-sentient"
                      htmlFor={`variant-price-${variantIndex}`}
                    >
                      Variant Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`variant-price-${variantIndex}`}
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Variant price"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      className="!font-sentient"
                      htmlFor={`variant-stock-${variantIndex}`}
                    >
                      Variant Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`variant-stock-${variantIndex}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(
                          variantIndex,
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Variant stock"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    className="!font-sentient"
                    htmlFor={`variant-description-${variantIndex}`}
                  >
                    Variant Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`variant-description-${variantIndex}`}
                    value={variant.description}
                    onChange={(e) =>
                      handleVariantChange(
                        variantIndex,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Variant description"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      Variant Images <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVariantImageField(variantIndex)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Image
                    </Button>
                  </div>

                  {variant.image.map((img, imgIndex) => (
                    <ImageFileUploadField
                      key={imgIndex}
                      image={img}
                      index={imgIndex}
                      onFileChange={(index: number, file: File) =>
                        handleVariantImageFileChange(
                          variantIndex,
                          imgIndex,
                          file
                        )
                      }
                      onRemove={() =>
                        removeVariantImageField(variantIndex, imgIndex)
                      }
                      canRemove={variant.image.length > 1}
                    />
                  ))}
                </div>
              </div>
            ))}
            {errors.variants && (
              <p className="text-red-500 text-sm">{errors.variants.message}</p>
            )}
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
};
