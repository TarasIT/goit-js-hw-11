import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';

const refs = {
  searchBox: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

const DEBOUNCE_DELAY = 300;

refs.searchBox.addEventListener(
  'input',
  debounce(searchCountry, DEBOUNCE_DELAY)
);

function searchCountry(event) {
  const country = event.target.value.trim();

  if (country === '') {
    clearCountriesList();
    clearSelectedCountry();
    return;
  }

  fetchCountries(country)
    .then(country => {
      if (country.length > 10) {
        clearCountriesList();
        clearSelectedCountry();
        Notiflix.Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      if (country.length >= 2 && country.length <= 10) {
        renderCountriesList(country);
        clearSelectedCountry();
      }

      if (country.length === 1) {
        renderSelectedCountry(country);
        clearCountriesList();
      }
    })
    .catch(() => {
      clearCountriesList();
      clearSelectedCountry();
      Notiflix.Notify.failure('Oops, there is no country with that name.');
    });
}

function renderSelectedCountry(country) {
  const markup = country
    .map(country => {
      const { name, capital, population, languages, flags } = country;
      const nativeLanguages = Object.values(languages);

      return `
            <div class="container">
              <img class="flag" src="${flags.svg}" width="100" height="70" alt="The flag of ${name.official}">
              <h1 class="country-title">${name.official}</h1>
            </div>
            <p><span class="option">Capital:</span> ${capital}</p>
            <p><span class="option">Population:</span> ${population}</p>
            <p><span class="option">Languages:</span> ${nativeLanguages}</p>
        `;
    })
    .join('');
  refs.countryInfo.innerHTML = markup;
}

function renderCountriesList(country) {
  const markup = country
    .map(country => {
      const { name, flags } = country;

      return `
            <li class="country-preview">
              <img class="flag" src="${flags.svg}" width="50" height="30" alt="The flag of ${name.official}">
              <p>${name.official}</p>
            </li>
        `;
    })
    .join('');
  refs.countryList.innerHTML = markup;
}

function clearSelectedCountry() {
  return (refs.countryInfo.innerHTML = '');
}

function clearCountriesList() {
  return (refs.countryList.innerHTML = '');
}
