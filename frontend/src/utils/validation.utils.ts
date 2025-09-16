/**
 * Input validation utility functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if string is not empty after trimming
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate string length
 */
export function isValidLength(value: string, min: number = 0, max: number = Infinity): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate if value is a number
 */
export function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate if value is a positive number
 */
export function isPositiveNumber(value: any): boolean {
  return isNumber(value) && parseFloat(value) > 0;
}

/**
 * Validate if value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

/**
 * Validate year
 */
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 5; // Allow up to 5 years in the future
}

/**
 * Validate rating
 */
export function isValidRating(rating: number): boolean {
  return isInRange(rating, 0, 10);
}

/**
 * Validate genre ID
 */
export function isValidGenreId(genreId: number): boolean {
  return isPositiveNumber(genreId) && Number.isInteger(genreId);
}

/**
 * Validate content type
 */
export function isValidContentType(type: string): type is 'movie' | 'tv' {
  return type === 'movie' || type === 'tv';
}

/**
 * Validate sort option
 */
export function isValidSortBy(sortBy: string): sortBy is 'popularity' | 'release_date' | 'vote_average' {
  return ['popularity', 'release_date', 'vote_average'].includes(sortBy);
}

/**
 * Validate sort order
 */
export function isValidSortOrder(sortOrder: string): sortOrder is 'asc' | 'desc' {
  return sortOrder === 'asc' || sortOrder === 'desc';
}

/**
 * Validate page number
 */
export function isValidPage(page: number): boolean {
  return isPositiveNumber(page) && Number.isInteger(page) && page <= 1000; // API pagination limit
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
}

/**
 * Validate and sanitize form data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validate search form data
 */
export function validateSearchForm(data: {
  query: string;
  type?: string;
  year?: number;
  rating?: number;
  genres?: number[];
}): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validate query
  if (!isValidSearchQuery(data.query)) {
    errors.push('Search query must be between 1 and 100 characters');
  } else {
    sanitizedData.query = sanitizeSearchQuery(data.query);
  }

  // Validate type
  if (data.type && !isValidContentType(data.type)) {
    errors.push('Content type must be "movie" or "tv"');
  } else if (data.type) {
    sanitizedData.type = data.type;
  }

  // Validate year
  if (data.year !== undefined) {
    if (!isValidYear(data.year)) {
      errors.push('Year must be between 1900 and current year + 5');
    } else {
      sanitizedData.year = data.year;
    }
  }

  // Validate rating
  if (data.rating !== undefined) {
    if (!isValidRating(data.rating)) {
      errors.push('Rating must be between 0 and 10');
    } else {
      sanitizedData.rating = data.rating;
    }
  }

  // Validate genres
  if (data.genres && Array.isArray(data.genres)) {
    const validGenres = data.genres.filter(isValidGenreId);
    if (validGenres.length !== data.genres.length) {
      errors.push('All genre IDs must be positive integers');
    } else {
      sanitizedData.genres = validGenres;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Debounce validation function
 */
export function createDebouncedValidator<T>(
  validator: (data: T) => ValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (data: T, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(data);
      callback(result);
    }, delay);
  };
}