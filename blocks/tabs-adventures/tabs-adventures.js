// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Group a tab panel's flat content (image paragraph, heading, description
 * paragraph — repeating) into a grid of adventure cards.
 * @param {Element} panel The tab panel content cell
 */
function buildCardGrid(panel) {
  const content = panel.firstElementChild || panel;
  const nodes = [...content.children];
  const grid = document.createElement('ul');
  grid.className = 'tabs-adventures-grid';

  let current = null;
  nodes.forEach((node) => {
    const isImage = node.querySelector('picture, img') && !node.querySelector('h1, h2, h3, h4, h5, h6');
    if (isImage) {
      // start a new card on each image
      current = document.createElement('li');
      current.className = 'tabs-adventures-card';
      const imageWrap = document.createElement('div');
      imageWrap.className = 'tabs-adventures-card-image';
      imageWrap.append(node);
      current.append(imageWrap);
      const body = document.createElement('div');
      body.className = 'tabs-adventures-card-body';
      current.append(body);
      grid.append(current);
    } else if (current) {
      current.querySelector('.tabs-adventures-card-body').append(node);
    }
  });

  content.replaceWith(grid);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventures-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventures-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-adventures-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();

    // now that the label cell is gone, group the remaining panel content into a card grid
    buildCardGrid(tabpanel);
  });

  block.prepend(tablist);
}
