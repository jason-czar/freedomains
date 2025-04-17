
export const setSearchParam = (domain: string) => {
  const searchParams = new URLSearchParams();
  searchParams.set('domain', domain);
  return `?${searchParams.toString()}`;
};

export const getSearchParam = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('domain') || '';
};
