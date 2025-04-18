
export const validateDomainName = (domain: string) => {
  const isValid = /^[a-z0-9-]{3,63}$/.test(domain) && !domain.startsWith('-') && !domain.endsWith('-');
  return isValid;
};
