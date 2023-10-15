import L from 'leaflet'
import { svgCreate, pointsToPath } from './lib/svg_util';

const log = console.log;

export const SVGText = L.SVG.extend({
  _initContainer() {
    L.SVG.prototype._initContainer.call(this);

    this.on('update', () => {
      log('updated');
    });
  },

  _initPath(layer) {
    L.SVG.prototype._initPath.call(this, layer);

    console.log('LAYER', layer);
    
  },

  _addPath(layer) {
    
    this._parent = this.options.parent;
    const content = this._parent.options.text || 'No text';

    this._parent.on('update', () => log('update'));

    // Guide path
    const id = 'text-path-'.concat(layer._leaflet_id);
    this._path = svgCreate('path');
    this._path.id = id;
    this._path.setAttribute('stroke', 'purple');
    this._rootGroup.appendChild(this._path);

    // text
    this._text = svgCreate('text');
    this._text.setAttribute('dominant-baseline', 'hanging');

    this._text.style.transformBox = 'fill-box';
    this._text.style.transition = 'transform 0.3s ease';
    this._text.style.scale = 1;
    // this._text.textContent = content;

    this._rootGroup.appendChild(this._text);

    // return;
    // text path
    this._textPath = svgCreate('textPath');
    this._textPath.setAttribute('href', '#'.concat(id));
    this._textPath.textContent = content;

    this._text.appendChild(this._textPath);
    // get initial text width for scale basis
    this._baseWidth = this._text.getBoundingClientRect().width;

    // this._setOrigin();
    // this._setDraggable();
  },

  _setDraggable() {
    if (!this.options.draggable) return;

    this._draggable = new Draggable(this._parent._path);
    this._draggable.enable();

    this._draggable.on('drag', (e) => {
      // const style = window.getComputedStyle(this._parent._path);
      // const translate = style.getPropertyValue('transform');
      // this._text.setAttribute('matrix', translate);

      // const transform = this._parent._path.style.transform;
      // this._text.style.transform = transform;
      const { target } = e;
      const pos = target._newPos;
      log('drag', target);
    });
  },

  _setOrigin() {
    const svg = this._parent._path.closest('svg');
    const ctm = svg.getScreenCTM().inverse();

    const rect = this._parent._path.getBoundingClientRect();
    let point = svg.createSVGPoint();
    point.x = Math.floor(rect.x);
    point.y = Math.floor(rect.y);
    point = point.matrixTransform(ctm);

    const origin = ['x', 'y'].map((k) => point[k] + 'px').join(' ');
    // log(origin);
    // this._text.style.transformOrigin = origin;
  },

  _updatePoly(layer, closed) {
    L.SVG.prototype._updatePoly.call(this, layer, closed);

    if (!this._parent) return;

    this._setTextPath();
    this._fitText();
  },

  _setTextPath() {
    const rings = this._parent._rings[0];
    const points = rings.slice(1, 3);
    const def = pointsToPath([points], false);
    this._path.setAttribute('d', def);
  },

  _fitText() {
    if (!this._text) return;
  
    const tolerance = 0.5; // Adjust as needed
    let fontSize = parseFloat(window.getComputedStyle(this._text).getPropertyValue('font-size'));
    let textWidth = this._text.getBoundingClientRect().width;
    const maxWidth = this._parent._path.getBoundingClientRect().width;
    
    let increaseCount = 0;
    // Increase font size if text is too small
    while (textWidth < maxWidth - tolerance) {
      fontSize += 0.5; // Adjust step size as needed
      this._text.style.fontSize = `${fontSize}px`;
      textWidth = this._text.getBoundingClientRect().width;
      console.log('increasing')
      if (increaseCount > 200) break;
      increaseCount++
    }
  
    let decreaseCount = 0;
    // Decrease font size if text is too large
    while (textWidth > maxWidth + tolerance) {
      fontSize -= 0.5; // Adjust step size as needed
      this._text.style.fontSize = `${fontSize}px`;
      textWidth = this._text.getBoundingClientRect().width;
      console.log('decreasing')
      if (decreaseCount > 200) break;
      decreaseCount++
    }
  }
});

export function svgText(options) {
  return new SVGText(options);
}
