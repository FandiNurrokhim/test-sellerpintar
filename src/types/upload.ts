export interface UploadResponse {
  status: string;
  code: number;
  message: string;
  data: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    category: string;
    tags: string[];
    isPublic: boolean;
    description: string;
    altText: string;
    createdAt: string;
  };
}

export interface ImageItem {
  url: string;
  file?: File;
  isUploading?: boolean;
}
