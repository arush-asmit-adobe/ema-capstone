import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Convert any trailing "Read More" CTA link into a button.
  ul.querySelectorAll('.cards-promo-card-body a').forEach((a) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-promo-cta';
    button.textContent = a.textContent;
    button.addEventListener('click', () => {
      window.location.href = a.getAttribute('href') || '#';
    });
    a.replaceWith(button);
  });

  block.textContent = '';
  block.append(ul);
}
