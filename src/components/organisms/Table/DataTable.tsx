"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import TablePagination from "@/components/molecules/Table/TablePagination";

type DataTableProps<TData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

function DataTable<TData, TValue = unknown>({
  columns,
  data,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const pageCount = Math.ceil(total / pageSize);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    manualPagination: true,
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="overflow-x-auto min-h-[350px]">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50 dark:bg-[#232336]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="min-h-[200px]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-400 dark:text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-gray-400 dark:text-gray-500"
                >
                  No data available.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 dark:hover:bg-[#232336]/70 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-3 text-sm text-[#787878] dark:text-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && data.length > 0 && pageCount > 1 && (
          <TablePagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}

export default DataTable;
