import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
const perPage = 15;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = e.currentTarget.elements['searchQuery'].value.trim();
  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Enter a search query',
      position: 'topRight',
    });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page, perPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'No Results',
        message: 'No images found. Try another query!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);
    if (totalHits > perPage) showLoadMoreButton();
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page, perPage);
    createGallery(data.hits);

    if (page * perPage >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End of results',
        message: "You've reached the end.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});
