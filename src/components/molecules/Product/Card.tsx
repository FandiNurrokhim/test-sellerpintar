import Image from "next/image";
import { useRouter } from "next/navigation";
import ActionDropdown from "@/components/molecules/ActionDropdown";

type BaseItem = {
  id: string | number;
  [key: string]: unknown;
};

type ProductCardProps = {
  name: string;
  category: string;
  price: string;
  image: string;
  item: BaseItem;
  status: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  category,
  price,
  image,
  status,
  item,
  onView,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (status !== "Sold Out") {
      router.push(`/catalogue/${item.id}`);
    }
  };

  return (
    <div className="border-3 border-[#f1f1f1] dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#232336] flex flex-col items-center relative">
      <Image
        src={image}
        alt={name}
        width={260}
        height={180}
        className="w-[260px] h-[180px] mb-4 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
      />
      <div className="w-full flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-xs md:text-xs lg:text-md xxl:text-lg">
                {name.length > 50 ? name.slice(0, 50) + "..." : name}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-300 mb-2">
                {category}
              </p>
            </div>
            <div className="font-bold text-xs md:text-xs lg:text-md xxl:text-lg text-gray-900 dark:text-white mb-2">
              <p>{price}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            className={`flex-1 h-9 px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1 justify-center cursor-pointer
            ${
              status === "Sold Out"
                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-100 dark:text-yellow-700"
                : "bg-black dark:bg-black hover:bg-gray-800 transition text-white  dark:text-white"
            }
          `}
            onClick={handleCardClick}
            disabled={status === "Sold Out"}
          >
            <span
              className={`w-1 h-1 rounded-full inline-block ${
                status === "Sold Out"
                  ? "bg-yellow-500"
                  : "bg-white dark:bg-black"
              }`}
            />
            {status === "Sold Out" ? "Sold Out" : "Buy This Product"}
          </button>
          <div>
            <ActionDropdown
              item={item}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              className="border border-gray-200 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
