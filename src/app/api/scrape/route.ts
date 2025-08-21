// app/api/scrape/route.ts
import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 500 }
      );
    }

    const app = new FirecrawlApp({ apiKey });

    // ✅ Panggil SDK scrapeUrl
    const scrapeResult = (await app.scrapeUrl(url, {
      formats: ["markdown", "html"], // bisa tambah "text" jika perlu
    })) as ScrapeResponse;

    if (!scrapeResult.success) {
      return NextResponse.json(
        { error: "Failed to scrape", details: scrapeResult.error },
        { status: 500 }
      );
    }

    // Pilih format yang mau dikirim balik — di sini pakai markdown
    const markdown =
      scrapeResult.markdown ||
      scrapeResult.html ||
      "No content found from scrape.";

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="scraped-content.txt"`,
      },
    });
  } catch (error) {
    let message = "Unexpected error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }
    return NextResponse.json(
      { error: "Unexpected error", details: message },
      { status: 500 }
    );
  }
}
