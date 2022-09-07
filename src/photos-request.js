const axios = require('axios');

const PHOTOS_BASE_URL = 'https://pixabay.com/api/?';

export default class PhotosLoadService {
  constructor() {
    this.searchPhotos = '';
    this.page = 1;
    this.photosSearchLimit = 40;
  }

  async requestPhotos() {
    const searchParams = new URLSearchParams({
      key: '29684807-93441b9500ca74c45f98c22c3',
      q: this.searchPhotos,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: this.photosSearchLimit,
      page: this.page,
    });

    this.incrementPage();
    const response = await axios(`${PHOTOS_BASE_URL}${searchParams}`);
    return response.data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchPhotos;
  }

  set query(newPhotos) {
    return (this.searchPhotos = newPhotos);
  }
}
