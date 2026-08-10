export default function decorate(block) {
  const rows = [...block.children];

  // first row holds the background image, second row holds the content
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const contentRow = rows.find((row) => !row.querySelector('picture'));

  if (imageRow) imageRow.classList.add('hero-banner-image');
  if (!imageRow) block.classList.add('no-image');

  if (contentRow) {
    contentRow.classList.add('hero-banner-content');

    // convert the CTA link ("See Trip") into an actual button pointing to '#'
    const cta = contentRow.querySelector('p:last-child a');
    if (cta) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hero-banner-cta';
      button.textContent = cta.textContent;
      button.addEventListener('click', () => {
        window.location.href = '#';
      });
      cta.closest('p').classList.add('hero-banner-cta-wrapper');
      cta.replaceWith(button);
    }
  }
}
