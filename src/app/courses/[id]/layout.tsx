import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const courseId = resolvedParams.id as Id<"courses">;

  try {
    const course = await fetchQuery(api.courses.getById, { id: courseId });
    if (!course) return { title: "Course Not Found" };

    const thumbnail = (course.thumbnailMediaId as string | undefined) ?? course.thumbnailUrl;
    const thumbnailUrl = thumbnail && !thumbnail.startsWith("http") && !thumbnail.startsWith("/") && typeof window === "undefined"
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/media/${thumbnail}/thumbnail`
      : thumbnail;
    return {
      title: course.title,
      description: course.description,
      openGraph: {
        title: course.title,
        description: course.description,
        type: "website",
        images: thumbnailUrl ? [{ url: thumbnailUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description: course.description,
        images: thumbnailUrl ? [thumbnailUrl] : undefined,
      },
    };
  } catch {
    return { title: "Course Overview" };
  }
}

export default function CourseDetailLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
