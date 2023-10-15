function svgCreate(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function pointsToPath(rings, closed) {
	var str = '',
	i, j, len, len2, points, p;

	for (i = 0, len = rings.length; i < len; i++) {
		points = rings[i];

		for (j = 0, len2 = points.length; j < len2; j++) {
			p = points[j];
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}

		// closes the ring for polygons; "x" is VML syntax
		str += closed ? (Browser.svg ? 'z' : 'x') : '';
	}

	// SVG complains about empty path strings
	return str || 'M0 0';
}

export {
  svgCreate, 
  pointsToPath
}