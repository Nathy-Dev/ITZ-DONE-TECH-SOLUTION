import { MetadataRoute } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://itz-done-tech-solution.vercel.app';

  // 1. Fetch all courses for dynamic routes
  let courses: any[] = [];
  try {
    courses = await fetchQuery(api.courses.list);
  } catch (error) {
    console.error('Failed to fetch courses for sitemap', error);
  }

  const courseUrls = courses
    .filter((c) => c.isPublished)
    .map((c) => ({
      url: `${baseUrl}/courses/${c._id}`,
      lastModified: c.publishedAt ? new Date(c.publishedAt) : new Date(),
    }));

  // 2. Static routes
  const routes = [
    '',
    '/courses',
    '/business',
    '/mentorship',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  return [...routes, ...courseUrls];
}
