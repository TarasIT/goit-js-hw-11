import './css/styles.css';
import PhotosLoadService from './photos-request';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';

const refs = {
  searchform: document.querySelector('#search-form'),
  input: document.querySelector('#search-form > input'),
  submitBtn: document.querySelector('#search-form > button'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const photosLoadService = new PhotosLoadService();
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionDelay: 250,
});

refs.searchform.addEventListener('submit', searchPhoto);
refs.loadMoreBtn.addEventListener('click', renderNextPhotosGroup);

function searchPhoto(event) {
  event.preventDefault();
  photosLoadService.query = refs.input.value;

  if (photosLoadService.query === '') {
    return Notiflix.Notify.info(
      'Please, enter youre request in the search form.'
    );
  }

  renderFirstPhotosGroup();
  clearPhotosGallery();
  hideLoadMoreBtn();
}

async function renderFirstPhotosGroup() {
  try {
    photosLoadService.resetPage();

    const obtainedPhotos = await photosLoadService.requestPhotos();
    const { hits, total } = obtainedPhotos;

    renderPhotosGallery(obtainedPhotos);
    simpleLightBox.refresh();
    showLoadMoreBtn();

    if (hits.length >= 1) {
      Notiflix.Notify.info(`Hooray! We found ${total} images.`);
    }

    if (hits.length === 0) {
      hideLoadMoreBtn();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function renderNextPhotosGroup() {
  try {
    const obtainedPhotos = await photosLoadService.requestPhotos();
    const { hits } = obtainedPhotos;

    renderPhotosGallery(obtainedPhotos);
    simpleLightBox.refresh();
    showLoadMoreBtn();

    if (hits.length < photosLoadService.photosSearchLimit) {
      hideLoadMoreBtn();
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (err) {
    console.log(err);
  }
}

function renderPhotosGallery({ hits }) {
  const markup = hits
    .map(hit => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = hit;

      return `
      <a class="gallery__item" href=${largeImageURL}>
        <div class="photo-card">
          <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" width=300 height=200>
          <div class="info">
            <p class="info-item"><b>Likes:</b> <span>${likes}</span></p>
            <p class="info-item"><b>Views:</b> <span>${views}</span></p>
            <p class="info-item"><b>Comments:</b> <span>${comments}</span></p>
            <p class="info-item"><b>Downloads:</b> <span>${downloads}</span></p>
          </div>
        </div>
      </a>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearPhotosGallery() {
  return (refs.gallery.innerHTML = '');
}

function showLoadMoreBtn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
}

function hideLoadMoreBtn() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}