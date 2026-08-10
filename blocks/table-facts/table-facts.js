/*
 * Table Block (table-facts variant)
 * Adventure "fact sheet": a 2-column label/value spec table (Activity, Adventure
 * Type, Trip Length, Group Size, Difficulty, Price, ...). Based on the Block
 * Collection table, adapted for this doc (non-xwalk) project where
 * moveInstrumentation is not available in scripts/scripts.js. Typically used
 * with the "no-header" variant so the first row is data rather than a header.
 * https://www.hlx.live/developer/block-collection/table
 */

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  // A fact-sheet has no header row: every row is a label/value pair. Only treat
  // the first row as a header if the author explicitly opts in with `with-header`.
  const header = block.classList.contains('with-header');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');

    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');

      if (i === 0) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });
  table.append(thead, tbody);
  block.replaceChildren(table);
}
