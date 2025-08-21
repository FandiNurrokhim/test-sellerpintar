import React from "react";
import Link from "next/link";

const orders = [
  {
    id: "o1",
    customer: "John Smith",
    date: "August 13, 2025, 10:15 AM",
    total: "$120",
    status: "completed",
  },
  {
    id: "o2",
    customer: "Anastasiya Primo",
    date: "August 13, 2025, 09:50 AM",
    total: "$75",
    status: "pending",
  },
  {
    id: "o3",
    customer: "Colt Heist",
    date: "August 12, 2025, 04:30 PM",
    total: "$200",
    status: "completed",
  },
  {
    id: "o4",
    customer: "Jane Doe",
    date: "August 12, 2025, 02:10 PM",
    total: "$60",
    status: "cancelled",
  },
];

export const LatestOrder: React.FC = () => (
  <div className="bg-white dark:bg-[#161618] rounded-2xl p-6 shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        Latest Orders
      </h3>
      <Link
        href="/dashboard/orders"
        className="text-xs text-blue-600 hover:text-blue-800 transition dark:text-blue-400"
      >
        View All
      </Link>
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 dark:text-gray-400">
          <th className="text-left py-2">Customer</th>
          <th className="text-left py-2">Date</th>
          <th className="text-left py-2">Total</th>
          <th className="text-left py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="border-t border-gray-100 dark:border-gray-700"
          >
            <td className="py-2 font-medium text-gray-900 dark:text-white">
              {order.customer}
            </td>
            <td className="py-2 text-gray-500 dark:text-gray-400">
              {order.date}
            </td>
            <td className="py-2 text-gray-900 dark:text-white">
              {order.total}
            </td>
            <td className="py-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
