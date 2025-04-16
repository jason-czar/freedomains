/**
 * Formatters for DNS record content
 */

/**
 * Formats a TXT record by ensuring it's wrapped in quotation marks
 */
export const formatTXTRecord = (content: string): string => {
  // Trim whitespace
  content = content.trim();
  
  // If the content is already wrapped in double quotes, return as is
  if (/^".*"$/.test(content)) {
    return content;
  }
  
  // Otherwise, wrap it in double quotes
  return `"${content}"`;
};
