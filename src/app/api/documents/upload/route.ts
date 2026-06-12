// Client-upload authorizer for Vercel Blob (handles large PDFs without the
// 4.5MB serverless body limit). Auth-gated by middleware (/api/documents).
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/heic",
          "image/webp",
          "image/gif",
          "text/plain",
          "text/csv",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/zip",
        ],
        maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // DB record is created client-side after upload resolves.
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 },
    );
  }
}
