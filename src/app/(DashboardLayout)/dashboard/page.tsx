"use client";

// Chart
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Components
import { StepperHorizontal } from "@/components/organisms/Stepper/StepperHorizontal";
import WidgetHeader from "@/components/templates/WidgetHeader";
import { TopProductSales } from "@/components/molecules/Analytic/TopProductSales";
import { LatestOrder } from "@/components/molecules/Analytic/LatestOrder";

// Icons
import { Package, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const steps = [
    { title: "Branch Information", description: "Setup your branch" },
    { title: "Products", description: "Add your products" },
    { title: "AI Configuration", description: "Configure AI assistant" },
    {
      title: "Whatsapp Configuration",
      description: "Setup WhatsApp integration",
    },
    { title: "Whatsapp QR", description: "Scan WhatsApp QR" },
  ];

  const branchStatus = sessionStorage.getItem("alreadySetupBranch") === "true";
  const productStatus =
    sessionStorage.getItem("alreadySetupProduct") === "true";
  const aiStatus = sessionStorage.getItem("alreadySetupAI") === "true";
  const waStatus = sessionStorage.getItem("alreadySetupWhatsApp") === "true";
  const waQRStatus =
    sessionStorage.getItem("alreadySetupWhatsAppQR") === "true";

  const statusArr = [
    branchStatus,
    productStatus,
    aiStatus,
    waStatus,
    waQRStatus,
  ];

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Total Revenue",
        data: [3000, 4000, 3500, 5000, 4200, 4800, 5300],
        borderColor: "#2F49B3",
        backgroundColor: "rgba(47,73,179,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 overflow-hidden pb-10">
        <StepperHorizontal
          steps={steps.map((step, idx) => ({
            title: step.title,
            description: step.description,
            index: idx,
            isLast: idx === steps.length - 1,
            status: statusArr[idx],
          }))}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mt-4">
          <WidgetHeader
            variant="primary"
            title="Total Products"
            value={String(10)}
            icon={<Package className="h-5 w-5 text-blue-600 hover:text-blue-800 transition" />}
          />
          <WidgetHeader
            title="Customer Insights"
            value={String(12)}
            icon={<Package className="h-5 w-5 text-[#FFF]" />}
            variant="default"
          />
          <WidgetHeader
            title="Total Revenue"
            value="Rp 12.500.000"
            icon={<DollarSign className="h-5 w-5 text-white" />}
            variant="default"
          />
          <WidgetHeader
            title="Total Profit"
            value="Rp 3.200.000"
            icon={<DollarSign className="h-5 w-5 text-white" />}
            variant="default"
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <TopProductSales />
          <div className="w-full  bg-white dark:bg-[#161618] rounded-2xl p-4 shadow">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
              Performance Overview
            </h4>
            <Line data={chartData} height={180} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <LatestOrder />
        </div>
      </div>
    </>
  );
}
