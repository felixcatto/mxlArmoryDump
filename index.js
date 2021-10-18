import { groupBy, orderBy } from 'lodash-es';

const htmlToElement = html => {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
};

const trs = Array.from(document.querySelectorAll('#itemdump tbody tr'));
const excludedRawTypes = ['Potion', 'Horadric Cube'];
const rawItems = trs
  .map(tr => {
    const rawItemName = tr.querySelector('td:nth-child(1) div span').innerText;
    const rawItemType = tr.querySelector('td:nth-child(2)').innerText;
    const isSetColor = tr.querySelector('td:nth-child(2)').classList.contains('color-green');
    const itemName = rawItemName.replace(/(.*) \[.*/, '$1');
    const quantityMatch = rawItemName.match(/.*\[(.+)x\]/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const [, htmlItemType] = rawItemType.match(/.*\((.+)\)/) || [];
    const isEth = Boolean(rawItemType.match(/.*\[eth\]/i));
    const isRuneType = ['Rune', 'Essence', 'Runestone'].includes(rawItemType);
    let itemType;
    if (isSetColor) {
      itemType = 'SET';
    } else if (htmlItemType) {
      itemType = htmlItemType.toUpperCase();
    } else if (isRuneType) {
      itemType = 'RUNE';
    } else {
      itemType = 'MISC';
    }

    let itemNameWithForumCode;
    if (['SET', 'TU', 'SU', 'SSU', 'SSSU'].includes(itemType)) {
      itemNameWithForumCode = `[item]${itemName}[/item]`;
    } else if (itemType === 'RUNE') {
      itemNameWithForumCode = `[color=#0080FF]${itemName}[/color]`;
    } else {
      itemNameWithForumCode = itemName;
    }

    return {
      itemName,
      itemNameWithForumCode,
      rawItemType,
      itemType,
      quantity,
      isEth,
    };
  })
  .filter(el => !excludedRawTypes.includes(el.rawItemType));

const itemsWithQuantity = Object.entries(groupBy(rawItems, 'itemName')).map(([key, value]) => ({
  ...value[0],
  quantity: Math.max(value[0].quantity, value.length),
}));
const items = groupBy(orderBy(itemsWithQuantity, ['itemType']), 'itemType');
const armoryLink = window.location.href;
const forumCode = Object.keys(items).reduce((acc, itemType) => {
  const groupItems = itemType === 'MISC' ? items[itemType] : orderBy(items[itemType], ['itemName']);
  const itemsString = groupItems
    .map(el => {
      const quantityBadge = el.quantity > 1 ? `[color=#BFFFFF]x${el.quantity}[/color]` : '';
      const ethBadge = el.isEth ? `[color=#0080FF]eth[/color]` : '';
      return `${el.itemNameWithForumCode} ${ethBadge} ${quantityBadge}`;
    })
    .join('\n');
  return `${acc}[h3][color=#8000BF]${itemType}[/color][/h3]\n${itemsString}\n`;
}, `[h3][color=#FFFF40]ArmoryLink[/color][/h3]\n[url]${armoryLink}[/url]\n`);

navigator.clipboard.writeText(forumCode).then(() => {
  const isPopupExists = document.querySelector('.ipopup');
  if (!isPopupExists) {
    document.body.prepend(
      htmlToElement(`
      <style>
        .iwrapper {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          padding: 15px;
          display: flex;
          justify-content: center;
          z-index: 100;
          pointer-events: none;
          overflow: hidden;
        }
        .ipopup {
          font-size: 24px;
          padding: 10px;
          color: #fff;
          background: #0d6efd;
          border-radius: 10px;
          display: inline-block;
          transition: all 0.3s ease;
          transform: translate(100vw, 0);
        }
        .ipopup_active {
          transform: translate(0, 0);
        }
      </style>
    `)
    );
    document.body.prepend(
      htmlToElement(`
      <div class="iwrapper">
        <div class="ipopup">
          The items has successfully dumped to your clipboard. Use Ctrl+V to paste it.
        </div>
      </div>
    `)
    );
  }
  setTimeout(() => {
    document.querySelector('.ipopup').classList.add('ipopup_active');
  }, 0);
  setTimeout(() => {
    document.querySelector('.ipopup').classList.remove('ipopup_active');
  }, 9000);
});

window.groupBy = groupBy;
window.rawItems = rawItems;
window.itemsWithQuantity = itemsWithQuantity;
window.items = items;
window.forumCode = forumCode;
