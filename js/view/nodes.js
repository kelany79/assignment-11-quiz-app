export function node(tag, attrs = {}, kids = []) {
  const element = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === 'class') {
      element.className = value;
      return;
    }
    if (key === 'text') {
      element.textContent = value;
      return;
    }
    element.setAttribute(key, String(value));
  });

  kids.flat().forEach((kid) => {
    if (kid === undefined || kid === null || kid === false) return;
    element.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  });

  return element;
}

export function icon(name) {
  return node('i', { class: name });
}

export function decodeEntities(value) {
  const parsed = new DOMParser().parseFromString(String(value ?? ''), 'text/html');
  return parsed.body.textContent || '';
}
