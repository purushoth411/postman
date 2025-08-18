export const updateUrlFromParams = (baseUrl, params) => {
  let urlObj;

  try {
    // if full URL
    urlObj = new URL(baseUrl);
  } catch (e) {
    // if relative URL
    urlObj = new URL(baseUrl, window.location.origin);
  }

  urlObj.search = ""; // clear existing params
  params.forEach(({ key, value }) => {
    if (key) urlObj.searchParams.set(key, value);
  });

  return urlObj.href; // return full URL
};


export const parseQueryParams = (url) => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({ key, value }));
  } catch (err) {
    return [];
  }
};

