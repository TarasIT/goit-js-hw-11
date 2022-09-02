const SEARCH_COUNTRIES_URL = 'https://restcountries.com/v3.1/name/';

const countrySearchOptions = new URLSearchParams({
  fields: 'name,capital,population,languages,flags',
});

export function fetchCountries(country) {
  return fetch(
    `${SEARCH_COUNTRIES_URL}${country}?${countrySearchOptions}`
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}
