export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup columns: mark image columns and text columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
      } else {
        col.classList.add('columns-featured-text-col');

        // first paragraph acts as the eyebrow/pretitle ("Featured Article")
        const firstP = col.querySelector('p');
        if (firstP) firstP.classList.add('columns-featured-eyebrow');

        // convert the CTA link ("Full Article") into an actual button
        const cta = col.querySelector('p:last-child a');
        if (cta) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'columns-featured-cta';
          button.textContent = cta.textContent;
          // navigate to '#' for now
          button.addEventListener('click', () => {
            window.location.href = '#';
          });
          const ctaP = cta.closest('p');
          ctaP.classList.add('columns-featured-cta-wrapper');
          cta.replaceWith(button);
        }
      }
    });
  });
}
