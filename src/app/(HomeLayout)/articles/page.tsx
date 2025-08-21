"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Article } from "@/schemas/article/article";
import { articleApi } from "@/utils/apis/article";

// Component
import Hero from "@/components/organisms/Article/Hero";
import { CardArticle } from "@/components/molecules/Article/Card";
import ArticlePagination from "@/components/molecules/Article/ArticlePagination";

const pageSize = 8;

export default function ArticlesPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchArticles();
    }, 400);

    return () => clearTimeout(handler);
  }, [category, search, pageIndex]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: pageIndex + 1,
        pageSize,
      };
      if (category) params.category = category;
      if (search) params.search = search;

      const res = (await articleApi.getArticles(true, {
        method: "GET",
      })) as { data: Article[]; total?: number };

      setArticles((res.data as Article[]) || []);
      setPageCount(Math.ceil((res.total || 0) / pageSize));
    } catch (err) {
      setArticles([]);
      setPageCount(1);
    }
    setLoading(false);
  }, [category, search, pageIndex]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles, category, search, pageIndex]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPageIndex(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  const paginatedArticles = articles;

  return (
    <div>
      <Hero
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearchChange}
        category={category}
        search={search}
        loading={loading}
      />
      <div className="w-full px-6 md:px-8 lg:px-30 min-h-[400px]">
        <h2 className="!font-sentient font-bold dark:text-white/80 text-2xl mb-1 hidden md:block">
          Articles
        </h2>
        <p className="text-gray-500 dark:text-white/80 mb-6 text-[15px] hidden md:block">
          Showing: {paginatedArticles.length} of {articles.length} articles
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginatedArticles.length === 0 ? (
            <div className="col-span-4 flex flex-col items-center justify-center min-h-[200px] text-gray-500">
              <span>No articles found.</span>
              <span className="mt-2 text-sm">
                Try changing the search or category filter.
              </span>
            </div>
          ) : (
            paginatedArticles.map((article) => (
              <CardArticle key={article.id} article={article} />
            ))
          )}
        </div>
        {/* Hide pagination if no articles */}
        {paginatedArticles.length > 0 && (
          <ArticlePagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            onPageChange={setPageIndex}
          />
        )}
      </div>
    </div>
  );
}
