import './css/styles.css';
import PhotosLoadService from './photos-request';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const photosLoadService = new PhotosLoadService();
const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  searchform: document.querySelector('#search-form'),
  input: document.querySelector('#search-form > input'),
  gallery: document.querySelector('.gallery'),
  preloader: document.querySelector('.preloader'),
};

const observerOptions = {
  rootMargin: '0px',
  threshold: 1,
};
let galleryObserver = new IntersectionObserver(
  infiniteScrollGallery,
  observerOptions
);

refs.searchform.addEventListener('submit', renderFirstPhotosGroup);

async function renderFirstPhotosGroup(event) {
  try {
    event.preventDefault();
    photosLoadService.query = refs.input.value;

    if (photosLoadService.query === '') {
      return Notiflix.Notify.info(
        'Please, enter youre request in the search form.'
      );
    }

    photosLoadService.resetPage();
    clearPhotosGallery();

    const obtainedPhotos = await photosLoadService.requestPhotos();
    const { hits, total } = obtainedPhotos;

    renderGallery(obtainedPhotos);
    firstPhotosSmoothScroll();

    if (hits.length >= 1) {
      Notiflix.Notify.success(`Hooray! We found ${total} images.`);
    }

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (err) {
    console.log(err);
  }
}

function infiniteScrollGallery(entries, observer) {
  entries.forEach(entry => {
    const { isIntersecting, target } = entry;
    if (isIntersecting) {
      renderNextPhotosGroup();
      observer.unobserve(target);
    }
  });
}

async function renderNextPhotosGroup() {
  try {
    const obtainedPhotos = await photosLoadService.requestPhotos();
    const { hits } = obtainedPhotos;
    const lastGalleryItem = renderGallery(obtainedPhotos);

    nextPhotosSmoothScroll();

    if (hits.length < photosLoadService.photosSearchLimit) {
      galleryObserver.unobserve(lastGalleryItem);
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (err) {
    console.log(err);
  }
}

function renderGallery({ hits }) {
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
  simpleLightBox.refresh();

  const lastGalleryItem = refs.gallery.lastElementChild;

  if (lastGalleryItem) {
    galleryObserver.observe(lastGalleryItem);
  }

  return lastGalleryItem;
}

function clearPhotosGallery() {
  refs.gallery.innerHTML = '';
}

function firstPhotosSmoothScroll() {
  const searchFormHeight = refs.searchform.getBoundingClientRect().height;

  window.scrollTo({
    top: searchFormHeight * 1.25,
    behavior: 'smooth',
  });
}

function nextPhotosSmoothScroll() {
  const photosCardHeight = document
    .querySelector('.gallery__item')
    .getBoundingClientRect().height;

  window.scrollBy({
    top: photosCardHeight * 2,
    behavior: 'smooth',
  });
}
