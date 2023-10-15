import L from 'leaflet';
import { svgCreate, pointsToPath } from './lib/svg_util';


export const TextPolygon = L.Polygon.extend({
  onAdd() {
    L.Path.prototype.onAdd.call(this);
    console.log('layer',  this)

    const content = this.options.text || 'No text';

    // Group. Needed to add padding in fitText
    this._group = svgCreate('g')
    this._renderer._rootGroup.appendChild(this._group);

    // Guide path
    const id = 'text-path-'.concat(this._leaflet_id);
    this._guidePath = svgCreate('path');
    this._guidePath.id = id;
    // this._guidePath.setAttribute('stroke', 'purple');
    this._group.appendChild(this._guidePath);

    // text
    this._text = svgCreate('text');
    this._text.setAttribute('dominant-baseline', 'hanging');
    this._text.style.transformBox = 'fill-box';
    this._text.style.transition = 'transform 0.3s ease';
    this._text.style.scale = 1;
    this._group.appendChild(this._text);

    // text path
    this._textPath = svgCreate('textPath');
    this._textPath.setAttribute('href', '#'.concat(id));
    this._textPath.textContent = content;

    this._text.appendChild(this._textPath);
 
     this._updateTextPath();
  },

  _updatePath() {
    L.Polygon.prototype._updatePath.call(this);
    this._updateTextPath();
  },

  _updateTextPath() {
    
    if (!this._guidePath) return 

    // Update the text path to match the parent polygon
    const rings = this._rings[0];
    const points = rings.slice(1, 3);
    const def = pointsToPath([points], false);
    this._guidePath.setAttribute('d', def);

    // Fit the text to the parent polygon
    this._fitText();
  },

  _fitText() {
    if (!this._text) return;
  
    const padding = this._padding()
    
    const tolerance = 0.5; // Adjust as needed
    let fontSize = parseFloat(window.getComputedStyle(this._text).getPropertyValue('font-size'));
    let textWidth = this._text.getBoundingClientRect().width;
    // max width + reduce by right padding
    const maxWidth = this._path.getBoundingClientRect().width - (padding * 2)

    // Top/left padding
    this._group.setAttribute('transform', `translate(${padding}, ${padding})`);

    
    let increaseCount = 0;
    // Increase font size if text is too small
    while (textWidth < maxWidth - tolerance) {
      fontSize += 0.5; // Adjust step size as needed
      this._text.style.fontSize = `${fontSize}px`;
      textWidth = this._text.getBoundingClientRect().width;
      if (increaseCount > 200) break;
      increaseCount++
    }
  
    let decreaseCount = 0;
    // Decrease font size if text is too large
    while (textWidth > maxWidth + tolerance) {
      fontSize -= 0.5; // Adjust step size as needed
      this._text.style.fontSize = `${fontSize}px`;
      textWidth = this._text.getBoundingClientRect().width;
      if (decreaseCount > 200) break;
      decreaseCount++
    }
  },

  _padding() {
    const paddingPercent = 2.5
    const width = this._path.getBoundingClientRect().width
    const padding = width * (paddingPercent / 100)
    return padding
  },


  onRemove() {
    L.Path.prototype.onRemove.call(this);
    this._text.removeFrom(this._map);
  },
});


export function textPolygon(latlngs, options) {
  return new TextPolygon(latlngs, options);
}
