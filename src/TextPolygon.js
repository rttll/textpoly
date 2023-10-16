import L from 'leaflet';
import { svgCreate, pointsToPath } from './lib/svg_util';

const baselines = {
  top: 'hanging',
  center: 'initial',
  bottom: 'text-after-edge',
};

export const TextPolygon = L.Polygon.extend({
  onAdd() {
    L.Path.prototype.onAdd.call(this);

    // Group. Needed to add padding in fitText
    this._group = svgCreate('g');
    this._renderer._rootGroup.appendChild(this._group);

    this._paths = {
      top: null,
      center: null,
      bottom: null,
    };

    if (Array.isArray(this.options.text)) {
      this._paths.top = this._createTextPath(this.options.text[0], 'top');
      if (this.options.text.length === 3) {
        this._paths.center = this._createTextPath(
          this.options.text[1],
          'center'
        );
        this._paths.bottom = this._createTextPath(
          this.options.text[2],
          'bottom'
        );
      } else if (this.options.text.length === 2) {
        this._paths.bottom = this._createTextPath(
          this.options.text[1],
          'bottom'
        );
      }
    } else {
      this._paths.top = this._createTextPath(this.options.text, 'top');
    }

    this._updateTextPaths();
  },

  _createTextPath(content, position = 'top') {
    const container = {};

    // Guide path
    const id = 'text-path-'.concat(this._leaflet_id, '-', position);
    container.guidePath = svgCreate('path');
    // container.guidePath.setAttribute('stroke', 'purple');
    container.guidePath.id = id;
    this._group.appendChild(container.guidePath);

    // text
    container.text = svgCreate('text');
    container.text.setAttribute('dominant-baseline', baselines[position]);
    container.text.style.transformBox = 'fill-box';
    container.text.style.transition = 'transform 0.3s ease';
    container.text.style.scale = 1;
    this._group.appendChild(container.text);

    // text path
    container.textPath = svgCreate('textPath');
    container.textPath.setAttribute('href', '#'.concat(id));
    container.textPath.textContent = content;
    container.text.appendChild(container.textPath);

    return container;
  },

  _updatePath() {
    L.Polygon.prototype._updatePath.call(this);
    this._updateTextPaths();
  },

  _updateTextPaths() {
    if (!this._paths) return;

    const calculateCenter = (rings) => {
      const topY = (rings[1].y + rings[2].y) / 2;
      const bottomY = (rings[0].y + rings[3].y) / 2;
      const centerY = (topY + bottomY) / 2;

      const leftX = (rings[0].x + rings[1].x) / 2;
      const rightX = (rings[2].x + rings[3].x) / 2;

      return [
        { x: leftX, y: centerY },
        { x: rightX, y: centerY },
      ];
    };

    const rings = this._rings[0];
    const points = {
      top: [rings[1], rings[2]],
      center: calculateCenter(rings),
      bottom: [rings[0], rings[3]],
    };

    Object.keys(this._paths)
      .filter((position) => this._paths[position] !== null)
      .forEach((position) => {
        const def = pointsToPath([points[position]], false);

        const container = this._paths[position];
        container.guidePath.setAttribute('d', def);

        // Fit the text to the parent polygon
        this._fitText(container);
      });
  },

  _fitText(container) {
    const padding = this._padding();

    const tolerance = 0.5;
    let fontSize = parseFloat(
      window.getComputedStyle(container.text).getPropertyValue('font-size')
    );
    let textWidth = container.text.getBoundingClientRect().width;

    const rightPadding = padding * 2;
    const maxWidth = this._path.getBoundingClientRect().width - rightPadding;

    // Top/left padding
    this._group.setAttribute('transform', `translate(${padding}, ${padding})`);

    let increaseCount = 0;
    while (textWidth < maxWidth - tolerance) {
      fontSize += 0.5;
      container.text.style.fontSize = `${fontSize}px`;
      textWidth = container.text.getBoundingClientRect().width;
      if (increaseCount > 200) break;
      increaseCount++;
    }

    let decreaseCount = 0;
    while (textWidth > maxWidth + tolerance) {
      fontSize -= 0.5;
      container.text.style.fontSize = `${fontSize}px`;
      textWidth = container.text.getBoundingClientRect().width;
      if (decreaseCount > 200) break;
      decreaseCount++;
    }
  },

  _padding() {
    const paddingPercent = 2.5;
    const width = this._path.getBoundingClientRect().width;
    const padding = width * (paddingPercent / 100);
    return padding;
  },

  onRemove() {
    L.Path.prototype.onRemove.call(this);
    // container.text.removeFrom(this._map);
  },
});

export function textPolygon(latlngs, options) {
  return new TextPolygon(latlngs, options);
}
