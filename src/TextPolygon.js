import L from 'leaflet';
import { svgText } from './SVGText';


export const TextPolygon = L.Polygon.extend({
  onAdd() {
    L.Path.prototype.onAdd.call(this);

    const renderer = svgText({
      parent: this,
      draggable: this.options.draggable,
    });

    const text = (this._text = L.polygon(this._latlngs, {
      color: 'blue',
      fill: false,
      renderer,
    }));
    text.addTo(this._map);
  },

  onRemove() {
    L.Path.prototype.onRemove.call(this);
    this._text.removeFrom(this._map);
  },
});


export function textPolygon(latlngs, options) {
  return new TextPolygon(latlngs, options);
}
