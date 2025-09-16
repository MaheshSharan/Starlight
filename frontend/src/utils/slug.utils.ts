import { Content } from '@/types/content.types';

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a content URL with slug and ID
 * Format: /content/{type}/{slug}-{id}
 */
export function createContentUrl(content: Content): string {
  const title = content.title || content.name || content.original_title || content.original_name || 'untitled';
  const slug = generateSlug(title);
  return `/content/${content.media_type}/${slug}-${content.id}`;
}

/**
 * Parse a content URL to extract ID and slug
 * Handles both formats:
 * - /content/tv/wednesday-119051 (new format with slug)
 * - /content/tv/119051 (old format with just ID)
 */
export function parseContentUrl(urlParam: string): { id: number; slug?: string } | null {
  // Try new format first: slug-id
  const slugIdMatch = urlParam.match(/^(.+)-(\d+)$/);
  if (slugIdMatch) {
    const [, slug, idStr] = slugIdMatch;
    const id = parseInt(idStr, 10);
    if (!isNaN(id) && id > 0) {
      return { id, slug };
    }
  }

  // Try old format: just id
  const id = parseInt(urlParam, 10);
  if (!isNaN(id) && id > 0) {
    return { id };
  }

  return null;
}

/**
 * Validate if a slug matches the expected content title
 */
export function validateSlug(content: Content, expectedSlug: string): boolean {
  const title = content.title || content.name || content.original_title || content.original_name || 'untitled';
  const actualSlug = generateSlug(title);
  return actualSlug === expectedSlug;
}

/**
 * Get the display title from content
 */
export function getContentTitle(content: Content): string {
  return content.title || content.name || content.original_title || content.original_name || 'Untitled';
}

/**
 * Create a player URL with slug and ID
 * Format: /player/{type}/{slug}-{id}?watch=s{season}e{episode} (for TV shows)
 * Format: /player/{type}/{slug}-{id} (for movies)
 */
export function createPlayerUrl(content: Content, season?: number, episode?: number): string {
  const title = content.title || content.name || content.original_title || content.original_name || 'untitled';
  const slug = generateSlug(title);
  let url = `/player/${content.media_type}/${slug}-${content.id}`;
  
  // Add watch parameter for TV shows
  if (content.media_type === 'tv' && season !== undefined && episode !== undefined) {
    url += `?watch=s${season}e${episode}`;
  }
  
  console.log('Generated player URL:', url);
  return url;
}

/**
 * Parse watch parameter from URL
 * Format: s{season}e{episode} (e.g., "s1e5" for season 1, episode 5)
 */
export function parseWatchParam(watchParam: string): { season: number; episode: number } | null {
  const match = watchParam.match(/^s(\d+)e(\d+)$/i);
  if (match) {
    const season = parseInt(match[1], 10);
    const episode = parseInt(match[2], 10);
    if (!isNaN(season) && !isNaN(episode) && season > 0 && episode > 0) {
      return { season, episode };
    }
  }
  return null;
}