export { slug } from "./slug";

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 238;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime;
}
