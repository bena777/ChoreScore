/**
 * Avatar Utility Functions
 * Uses S11-Avatar.com API for generating profile pictures from names
 */

/**
 * Generates a random hex color
 * @returns {string} Hex color without # (e.g., "ff5733")
 */
export function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Generates an avatar URL from a user's first and last name with a specific color
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} color - Hex color without # (optional, defaults to random)
 * @returns {string} Avatar URL
 */
export function generateAvatarUrl(firstName, lastName, color = null) {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const bgColor = color || generateRandomColor();
  
  if (!fullName) {
    return `https://www.s11-avatar.com/api/avatar?name=User&size=128&background=${bgColor}&color=ffffff&rounded=true&bold=true&length=2&format=png`;
  }

  const params = new URLSearchParams({
    name: fullName,
    size: '128',
    background: bgColor,
    color: 'ffffff',
    rounded: 'true',
    bold: 'true',
    length: '2',
    format: 'png',
  });

  return `https://www.s11-avatar.com/api/avatar?${params.toString()}`;
}

/**
 * Extracts the background color from an S11-Avatar URL
 * @param {string} url - Avatar URL
 * @returns {string|null} Hex color without # or null if not found
 */
export function extractColorFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('background');
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is an S11-Avatar generated URL
 * @param {string} url - URL to check
 * @returns {boolean} True if it's an S11-Avatar URL
 */
export function isGeneratedAvatar(url) {
  return url && url.includes('s11-avatar.com');
}

/**
 * Validates if a URL is a valid avatar URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid avatar URL
 */
export function isValidAvatarUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
