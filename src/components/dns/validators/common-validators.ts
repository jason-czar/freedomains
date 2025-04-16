
/**
 * Common validation utilities for DNS records
 */

/**
 * Validates an IPv4 address
 */
export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
};

/**
 * Validates an IPv6 address
 */
export const isValidIPv6 = (ip: string): boolean => {
  // Basic IPv6 validation
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}::?){1,7}[0-9a-fA-F]{1,4}$/.test(ip);
};

/**
 * Validates a hostname
 */
export const isValidHostname = (hostname: string): boolean => {
  // Simple hostname validation
  return /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(hostname);
};

/**
 * Validates an email address
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
