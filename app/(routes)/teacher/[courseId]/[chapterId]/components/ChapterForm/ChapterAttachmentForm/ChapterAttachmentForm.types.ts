export type ChapterAttachmentFormProps = {
  chapterId: string;
  courseId: string;
  videoUrl: string | null;
  documentUrl: string | null;
  imageUrl: string | null;
  resources?: Array<{ url: string; name: string; type?: string; size?: number }> | null;
};

export type AttachmentType = "video" | "document" | "image" | null;

