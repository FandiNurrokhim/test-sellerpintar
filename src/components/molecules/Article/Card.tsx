import Image from "next/image";
import { Badge } from "@/components/atoms/Badge";
import { Article } from "@/schemas/article/article";
import Link from "next/link";

type CardArticleProps = {
  article: Article;
};

export const CardArticle: React.FC<CardArticleProps> = ({ article }) => {
  return (
    <div className="rounded-2xl p-0 overflow-hidden max-w-md">
      <Image
        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
        alt={article.title}
        width={386}
        height={240}
        className="w-full h-[240px] object-cover rounded-md"
      />
      <div className="mt-2 !font-archivo">
        <p className="text-slate-600 text-sm font-normal mb-2">
          {new Date(article.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <Link href={`/articles/${article.id}`} className="font-semibold text-gray-900 text-lg mb-2">
          {article.title}
        </Link>
        <p className="text-slate-600 text-base mb-4">{article.content}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge>{article.category.name}</Badge>
        </div>
      </div>
    </div>
  );
};
