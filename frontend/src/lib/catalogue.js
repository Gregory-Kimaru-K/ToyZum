// Search runs locally until the API supports a name/search filter. Follow every
// connection page so results are never silently limited to the first page.
export async function fetchCatalogue(backendurl, signal, sellerEmail = null, gender = null) {
  const products = [];
  let categories = [];
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const response = await fetch(`${backendurl}toyzum/graphql/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        query: `query Storefront($after: String, $sellerEmail: String, $gender: ApiToyzumAppProductGenderChoices) {
          allCategories { id name slug image }
          allProducts(first: 100, after: $after, seller_Email: $sellerEmail, gender: $gender) {
            pageInfo { hasNextPage endCursor }
            edges { node {
              id name price discountedPrice slug images quantity description featured
              category { name slug industry { slug } }
              categories { name slug industry { slug } }
            } }
          }
        }`,
        variables: { after, sellerEmail, gender },
      }),
    });
    if (!response.ok) throw new Error('Catalogue unavailable');
    const result = await response.json();
    if (result.errors || !result.data?.allProducts) throw new Error('Catalogue unavailable');
    const connection = result.data.allProducts;
    products.push(...connection.edges.map(({ node }) => node));
    categories = result.data.allCategories || [];
    hasNextPage = connection.pageInfo.hasNextPage;
    const nextCursor = connection.pageInfo.endCursor;
    if (hasNextPage && (!nextCursor || nextCursor === after)) throw new Error('Catalogue pagination failed');
    after = nextCursor;
  }
  return { products, categories };
}

export function filterCatalogue(products, params) {
  const search = (params.get('q') || '').trim().toLowerCase();
  const category = params.get('categoryId');
  const industry = params.get('industryId');
  const min = params.get('price_Gt');
  const max = params.get('price_Lt');
  return products.filter(product => {
    const assigned = productCategories(product);
    const text = `${product.name} ${product.description || ''} ${assigned.map(item => item.name).join(' ')}`.toLowerCase();
    return (!search || search.split(/\s+/).every(word => text.includes(word)))
      && ((!category && !industry) || assigned.some(item => (!category || item.slug === category) && (!industry || item.industry?.slug === industry)))
      && (!min || productPrice(product) >= Number(min))
      && (!max || productPrice(product) <= Number(max));
  });
}

export function productCategories(product) {
  if (Array.isArray(product.category_details) && product.category_details.length) return product.category_details;
  if (Array.isArray(product.categories) && product.categories.some(item => item && typeof item === 'object')) return product.categories;
  return product.category && typeof product.category === 'object' ? [product.category] : [];
}

export function productPrice(product) {
  const discount = Number(product.discountedPrice ?? product.discounted_price);
  const regular = Number(product.price);
  return discount > 0 && discount < regular ? discount : regular;
}
