"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Plus, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import HeaderTitlePage from "@/components/templates/HeaderTitlePage";
import WidgetHeader from "@/components/templates/WidgetHeader";
import DataTable from "@/components/organisms/Table/DataTable";
import { Input } from "@/components/atoms/Forms/Input";
import { Button } from "@/components/atoms/Forms/Button";
import { CategoryModal } from "./partials/form";
import { EditCategoryModal } from "./partials/edit-form";

import { productApi } from "@/utils/apis/product";
import { Category } from "@/schemas/initiateSetup/product";
import { useToast } from "@/components/atoms/ToastProvider";
import ActionDropdown from "@/components/molecules/ActionDropdown";

export default function CategoriesPage() {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const handleAddCategory = () => {
    setIsModalOpen(false);
    fetchCategories();
  };

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      const result = (await productApi.getCategories()) as {
        data?: { categories?: Category[] };
      };

      const catsArray = result.data?.categories;

      let categories: Category[];
      if (Array.isArray(catsArray)) {
        categories = catsArray.map((cat) => ({
          ...cat,
          status: cat.active === true ? "active" : "inactive",
        }));
      } else {
        console.warn(
          "[Categories] No categories returned (data kosong atau bukan array)",
          result.data
        );
        categories = [];
      }

      setCategories(categories);
    } catch (err) {
      console.error("[Categories] Failed to fetch:", err);
      showToast("Gagal mengambil kategori: " + (err as Error).message, "error");
      setCategories([]);
    }
  }, [showToast]);

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    setIsEditModalOpen(false);
    setEditCategory(null);
    fetchCategories();
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await productApi.deleteCategory(category.id);
        showToast("Category deleted successfully", "success");
        fetchCategories();
      } catch (err) {
        showToast(
          "Failed to delete category" + (err as Error).message,
          "error"
        );
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const paginatedData = categories.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "No",
      cell: ({ row }) => {
        const rowIndex = pageIndex * pageSize + row.index + 1;
        return <span>{rowIndex}</span>;
      },
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "sequence", header: "Sequence" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              value === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-left">
          <ActionDropdown<Category>
            item={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditCategory(null);
        }}
        category={
          editCategory
            ? {
                id: editCategory.id,
                name: editCategory.name,
                sequence: editCategory.sequence,
                active: editCategory.active ?? editCategory.status === "active", // fallback ke status jika active undefined
              }
            : null
        }
        onSubmit={handleEditSubmit}
      />

      <HeaderTitlePage
        title="Categories"
        description="Manage your categories here. You can add, edit, or remove categories to organize your products and make it easier for customers to find what they are looking for. Use this page to keep your store well-structured and up to date."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <WidgetHeader
          variant="primary"
          title="Total Categories"
          value={String(categories.length)}
          icon={<Box className="h-5 w-5 text-[#001363]" />}
        />
        <WidgetHeader
          title="Active Categories"
          value={String(categories.filter((c) => c.status === "active").length)}
          icon={<Box className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Inactive Categories"
          value={String(
            categories.filter((c) => c.status === "inactive").length
          )}
          icon={<Box className="h-5 w-5 text-[#FFF]" />}
          variant="default"
        />
        <WidgetHeader
          title="Top Categories"
          value="Electronics (10 Products)"
          icon={<Box className="h-5 w-5 text-[#FFF]" />}
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
              onClick={() => alert("Add new category")}
            >
              <Filter className="size-4 text-[#151515] dark:text-white/80" />
            </Button>
            <Input
              type="search"
              placeholder="Search categories..."
              className="w-64 h-10"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 h-10"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={paginatedData}
          total={categories.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
        />
      </div>
    </>
  );
}
