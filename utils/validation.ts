// utils/validation.ts

/**
 * Validates username according to app requirements
 * - Must start with letter
 * - Can contain letters, numbers, underscores, hyphens
 * - Must end with letter or number (no trailing _/-)
 * - 3-20 characters
 * - No spaces
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  // Handle null/undefined/invalid types
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'Username must be 20 characters or fewer' };
  }

  // Starts with letter, then letters/numbers/_/-, no trailing/leading _/-
  const pattern = /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z0-9]$/;
  
  // Special case for 2-character usernames (letter + single valid char)
  const pattern2Char = /^[a-zA-Z][a-zA-Z0-9]$/;

  if (!pattern.test(trimmed) && !pattern2Char.test(trimmed)) {
    if (trimmed.includes(' ')) {
      return { isValid: false, error: 'Username cannot contain spaces' };
    }
    if (trimmed.startsWith('_') || trimmed.startsWith('-') || trimmed.endsWith('_') || trimmed.endsWith('-')) {
      return { isValid: false, error: 'Username cannot start or end with underscore or hyphen' };
    }
    return {
      isValid: false,
      error: 'Only letters, numbers, underscores (_) and hyphens (-) allowed. Must start and end with a letter or number.',
    };
  }

  return { isValid: true };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true };
}
