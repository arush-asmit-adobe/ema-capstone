// eslint-disable-next-line import/no-unresolved
import { createOptimizedPicture } from '../../scripts/aem.js';

const CAROUSEL_INDEX = '/carousel-index.json';

/**
 * Build one authored-shaped carousel row from a carousel-index record.
 * The row matches the structure createSlide() expects: an image column
 * followed by a content column (heading + description + CTA link).
 * @param {{title:string,description:string,image:string,imageAlt:string,cta:string}} slide
 * @param {number} idx slide index (used for a unique heading id + eager LCP image)
 * @returns {HTMLDivElement}
 */
function buildDynamicRow(slide, idx) {
  const row = document.createElement('div');

  const imageCol = document.createElement('div');
  if (slide.image) {
    // first slide is the LCP candidate → load eagerly at a large width
    const pic = createOptimizedPicture(slide.image, slide.imageAlt || slide.title, idx === 0, [{ width: '2000' }]);
    imageCol.append(pic);
  }

  const contentCol = document.createElement('div');
  const heading = document.createElement('h2');
  heading.id = `carousel-hero-dynamic-slide-${idx}`;
  heading.textContent = slide.title || '';
  contentCol.append(heading);
  if (slide.description) {
    const desc = document.createElement('p');
    desc.textContent = slide.description;
    contentCol.append(desc);
  }
  const ctaP = document.createElement('p');
  const cta = document.createElement('a');
  cta.href = slide.ctaHref || '#';
  cta.textContent = slide.cta || 'View Trips';
  ctaP.append(cta);
  contentCol.append(ctaP);

  row.append(imageCol, contentCol);
  return row;
}

/**
 * Replace the carousel's authored rows with slides built from the carousel
 * index (a curated sheet of hero slides). On any failure (index missing/empty)
 * the authored rows are left untouched so the carousel still renders. Runs
 * before the main decoration pipeline.
 * @param {Element} block
 */
async function applyDynamicSlides(block) {
  try {
    const resp = await fetch(CAROUSEL_INDEX);
    if (!resp.ok) throw new Error(`carousel-index ${resp.status}`);
    const json = await resp.json();
    const items = json.data || [];
    if (!items.length) throw new Error('no carousel entries');

    block.textContent = '';
    items.forEach((slide, idx) => block.append(buildDynamicRow(slide, idx)));
  } catch (e) {
    // graceful fallback: keep the authored slides if the index is unavailable
    // eslint-disable-next-line no-console
    console.warn('carousel-hero: falling back to authored slides —', e.message);
  }
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // convert the CTA link into an actual button that navigates to its href
  const cta = slide.querySelector('.carousel-hero-slide-content p:last-child a');
  if (cta) {
    const href = cta.getAttribute('href') || '#';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-hero-cta';
    button.textContent = cta.textContent;
    button.addEventListener('click', () => {
      window.location.href = href;
    });
    cta.replaceWith(button);
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-${carouselId}`);

  // Populate slides dynamically from the query index (falls back to authored).
  await applyDynamicSlides(block);

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    // Place prev/next controls inside the indicator bar (alongside the dots).
    slideIndicators.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
