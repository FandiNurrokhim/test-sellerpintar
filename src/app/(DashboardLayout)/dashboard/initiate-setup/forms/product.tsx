"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import { useBranch } from "@/context/BranchContext";
import { useSession } from "next-auth/react";
import { useFieldArray, useWatch } from "react-hook-form";
import { FormField } from "@/components/templates/Forms/FormField";
import { Input } from "@/components/atoms/Forms/Input";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import {
  productSchema,
  ProductFormData,
  ProductResponse,
  Category,
  ProductCreateResult,
  ProductPayload,
} from "@/schemas/initiateSetup/product";
import { useToast } from "@/components/atoms/ToastProvider";
import { productApi } from "@/utils/apis/product";

export interface ProductRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
}

interface ProductProps {
  onSubmitSuccess?: () => void;
}

export const ProductPage = forwardRef<ProductRef, ProductProps>(
  ({ onSubmitSuccess }, ref) => {
    const { showToast } = useToast();
    const [categories, setCategories] = useState<
      { label: string; value: string }[]
    >([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data: session } = useSession();
    const token = session?.user.accessToken;
    const organizationId = session?.organizationId;
    const { branchId } = useBranch();

    // Memoize headers to prevent unnecessary re-renders
    const headers = useMemo(() => {
      const headerObj: Record<string, string> = {};
      if (organizationId) headerObj["x-organization-id"] = organizationId;
      if (branchId) headerObj["x-branch-id"] = branchId;
      if (token) headerObj["Authorization"] = `Bearer ${token}`;
      return headerObj;
    }, [organizationId, branchId, token]);

    const {
      register,
      handleSubmit,
      control,
      setValue,
      formState: { errors },
      trigger,
    } = useZodForm(productSchema, {
      defaultValues: {
        title: "",
        sku: "",
        description: "",
        category: "",
        weight: 0,
        volume: 0,
        image: [{ url: "" }],
        variants: [{ title: "", price: 0, stock: 0, sku: "" }],
      },
    });
    const categoryValue = useWatch({ control, name: "category" });

    const { fields: variantFields, append: appendVariant } = useFieldArray({
      control,
      name: "variants",
    });

    const { fields: imageFields, append: appendImage } = useFieldArray({
      control,
      name: "image",
    });

    // --- API helpers ---
    const fetchCategories = useCallback(async (): Promise<void> => {
      setLoadingCategories(true);
      try {
        const result = (await productApi.getCategories()) as {
          data: { categories: Category[] };
        };
        const categories: Category[] = result?.data?.categories ?? [];
        setCategories(
          categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))
        );
      } catch (err) {
        console.error("[ProductPage] Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }, []);

    const fetchProduct = useCallback(
      async (
        productId: string,
        requireAuth = true,
        options = {},
        headers: Record<string, string> = {}
      ): Promise<ProductResponse["data"] | undefined> => {
        const result = (await productApi.getById(
          productId,
          requireAuth,
          options,
          headers
        )) as ProductResponse;
        return result?.data;
      },
      []
    );

    const createProduct = useCallback(
      async (
        payload: ProductPayload,
        requireAuth = true,
        options = {},
        headers: Record<string, string> = {}
      ): Promise<ProductCreateResult> => {
        return (await productApi.create(
          payload,
          requireAuth,
          options,
          headers
        )) as ProductCreateResult;
      },
      []
    );

    const updateProduct = useCallback(
      async (
        productId: string,
        payload: ProductPayload,
        requireAuth = true,
        options = {},
        headers: Record<string, string> = {}
      ) => {
        return await productApi.update(
          productId,
          payload,
          requireAuth,
          options,
          headers
        );
      },
      []
    );

    // --- Submit handler ---
    const onSubmit = async (data: ProductFormData): Promise<boolean> => {
      setIsLoading(true);
      try {
        const payload = {
          name: data.title,
          sku: data.sku,
          description: data.description,
          image: data.image.map((img) => img.url),
          price: data.variants[0]?.price ?? 0,
          categoryId: data.category,
          shipping: {
            weight: data.weight,
            volume: data.volume,
          },
          stock: data.variants[0]?.stock ?? 0,
          type: "product",
          sequence: 1,
          variants: data.variants.map((v) => ({
            name: v.title,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        };

        const productId = sessionStorage.getItem("createdProductId");
        if (productId) {
          await updateProduct(productId, payload, true, {}, headers);
          showToast("Product updated successfully!", "success");
        } else {
          const result: ProductCreateResult = await createProduct(
            payload,
            true,
            {},
            headers
          );
          const productId = result.data.product.variants[0]?.productId;
          if (productId) {
            sessionStorage.setItem("createdProductId", productId);
          }
          showToast("Product created successfully!", "success");
          sessionStorage.setItem("alreadySetupProduct", "true");
        }
        onSubmitSuccess?.();
        return true;
      } catch (err) {
        console.error("API error:", err);
        showToast("Failed to save product!", "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      const initializeData = async () => {
        try {
          setIsLoading(true);
          await fetchCategories();

          const productId = sessionStorage.getItem("createdProductId");
          if (productId) {
            const data = await fetchProduct(productId, true, {}, headers);
            if (data) {
              setValue("title", data.name ?? "");
              setValue("description", data.description ?? "");
              setValue(
                "category",
                typeof data.category === "object" && data.category !== null
                  ? data.category.id
                  : data.category ?? ""
              );
              setValue("weight", data.shipping.weight ?? 0);
              setValue("volume", data.shipping.volume ?? 0);
              setValue(
                "image",
                data.image?.map((url: string) => ({ url })) ?? [{ url: "" }]
              );
              setValue(
                "variants",
                data.variants?.map((v) => ({
                  title: v.name ?? "",
                  price: v.price ?? 0,
                  stock: v.stock ?? 0,
                  sku: v.sku ?? "",
                })) ?? [{ title: "", price: 0, stock: 0, sku: "" }]
              );
            }
          }
        } catch (error) {
          console.error("Error initializing data:", error);
          showToast(
            error instanceof Error ? error.message : "Failed to load data",
            "error"
          );
        } finally {
          setIsLoading(false);
        }
      };

      initializeData();
    }, [branchId, showToast, headers, setValue, fetchCategories, fetchProduct]);

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        const isFormValid = await trigger();
        if (!isFormValid) {
          showToast("Please fill in all required fields correctly", "error");
          return false;
        }
        return new Promise((resolve) => {
          handleSubmit(async (data) => {
            const success = await onSubmit(data);
            resolve(success);
          })();
        });
      },
      isLoading,
    }));

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading Product...</p>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(() => {})}>
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label={
              <Label className="!font-sentient" htmlFor="title">
                Product Title
              </Label>
            }
            input={
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter product title"
                className="w-full"
              />
            }
            error={errors.title}
          />
          <FormField
            label={
              <Label className="!font-sentient" htmlFor="title">
                SKU
              </Label>
            }
            input={
              <Input
                id="sku"
                {...register("sku")}
                placeholder="Enter product SKU"
                className="w-full"
              />
            }
            error={errors.sku}
          />
          <FormField
            label={
              <Label className="!font-sentient" htmlFor="description">
                Description
              </Label>
            }
            input={
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter product description"
                className="w-full"
              />
            }
            error={errors.description}
          />
          <FormField
            label={
              <Label className="!font-sentient" htmlFor="category">
                Category
              </Label>
            }
            input={
              <SelectSearch
                value={categoryValue}
                onChange={(value: string) => setValue("category", value)}
                options={categories}
                placeholder={
                  loadingCategories ? "Loading..." : "Select a category"
                }
              />
            }
            error={errors.category}
          />
          <div className="grid grid-cols-2 gap-6">
            <FormField
              label={
                <Label className="!font-sentient" htmlFor="weight">
                  Weight (kg)
                </Label>
              }
              input={
                <Input
                  id="weight"
                  type="number"
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="Enter product weight"
                  className="w-full"
                />
              }
              error={errors.weight}
            />
            <FormField
              label={
                <Label className="!font-sentient" htmlFor="volume">
                  Volume (m³)
                </Label>
              }
              input={
                <Input
                  id="volume"
                  type="number"
                  {...register("volume", { valueAsNumber: true })}
                  placeholder="Enter product volume"
                  className="w-full"
                />
              }
              error={errors.volume}
            />
          </div>

          {/* Images */}
          <div className="mt-4">
            <Label className="!font-sentient">Image URLs</Label>
            {imageFields.map((field, index) => (
              <div key={field.id} className="mt-2">
                <Input
                  id={`image.${index}.url`}
                  {...register(`image.${index}.url` as const)}
                  placeholder="Enter image URL"
                  className="w-full"
                />
                {errors.image?.[index]?.url && (
                  <span className="text-red-500 text-xs">
                    {errors.image[index]?.url?.message}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-gray-200 rounded"
              onClick={() => appendImage({ url: "" })}
            >
              + Add Image
            </button>
          </div>
        </div>

        <hr className="my-8" />

        <div className="mb-8">
          <h2 className="text-2xl !font-sentient font-semibold mb-1 dark:text-white/80">
            Variant Product
          </h2>
          <p className="text-[#A3AED0] text-sm mb-2 dark:text-white/60">
            Add different variants of the product with specific prices and
            stock.
          </p>
        </div>

        {variantFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-6 mb-8">
            <input
              className="focus:outline-none focus:ring-0 multiple-input"
              placeholder="Variant title here..."
              type="text"
              {...register(`variants.${index}.title` as const)}
            />
            <FormField
              label={
                <Label
                  className="!font-sentient"
                  htmlFor={`variants.${index}.price`}
                >
                  Price
                </Label>
              }
              input={
                <Input
                  id={`variants.${index}.price`}
                  type="number"
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                    setValueAs: (v) =>
                      v === "" || isNaN(Number(v)) ? 0 : Number(v),
                  })}
                  placeholder="Enter product price"
                  className="w-full"
                />
              }
              error={errors.variants?.[index]?.price}
            />
            <FormField
              label={
                <Label
                  className="!font-sentient"
                  htmlFor={`variants.${index}.stock`}
                >
                  Stock
                </Label>
              }
              input={
                <Input
                  id={`variants.${index}.stock`}
                  type="number"
                  {...register(`variants.${index}.stock`, {
                    valueAsNumber: true,
                    setValueAs: (v) =>
                      v === "" || isNaN(Number(v)) ? 0 : Number(v),
                  })}
                  placeholder="Enter product stock"
                  className="w-full"
                />
              }
              error={errors.variants?.[index]?.stock}
            />
            <FormField
              label={
                <Label
                  className="!font-sentient"
                  htmlFor={`variants.${index}.sku`}
                >
                  SKU
                </Label>
              }
              input={
                <Input
                  id={`variants.${index}.sku`}
                  type="text"
                  {...register(`variants.${index}.sku`, {
                    required: "SKU is required.",
                  })}
                  placeholder="Enter variant SKU"
                  className="w-full"
                />
              }
              error={errors.variants?.[index]?.sku}
            />
          </div>
        ))}
        {errors.variants?.message && (
          <span className="text-red-500 text-xs">
            {errors.variants.message}
          </span>
        )}
        <button
          type="button"
          className="mt-2 px-3 py-1 bg-gray-200 rounded cursor-pointer"
          onClick={() =>
            appendVariant({ title: "", price: 0, stock: 0, sku: "" })
          }
        >
          + Add Variant
        </button>
      </form>
    );
  }
);

ProductPage.displayName = "ProductPage";
