export type ChapterAttachmentFormProps = {
  chapterId: string;
  courseId: string;
  videoUrl: string | null;
  documentUrl: string | null;
  imageUrl: string | null;
};

export type AttachmentType = "video" | "document" | "image" | null;

