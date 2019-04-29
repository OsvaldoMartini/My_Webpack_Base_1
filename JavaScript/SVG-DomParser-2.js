var renderRatingReviews = function (opts) {
    var options = opts || {},
        namespace = 'http://www.w3.org/2000/svg',
        svg = document.createElementNS(namespace, 'svg'),
        circle = document.createElementNS(namespace, 'circle'),
        arc = document.createElementNS(namespace, 'path'),
        text = document.createElement('div'),
        width = options.width || 100,
        height = options.height || 100,
        radius = width / 2,
        container = options.container,
        thickness = options.thickness || 9,
        color = options.color === 'green' ? '#00B930' : options.color === 'orange' ? '#fe9d14' : options.color === 'red' ? '#ff5534' : '#00B930',
        rating = options.rating || 8,
        polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        },
        describeArc = function (x, y, radius, startAngle, endAngle) {
            var start = polarToCartesian(x, y, radius, endAngle),   
                end = polarToCartesian(x, y, radius, startAngle),
                arcSweep = endAngle - startAngle <= 180 ? "0" : "1",
                d = [
                    "M", start.x, start.y,
                    "A", radius, radius, 0, arcSweep, 0, end.x, end.y
                ].join(" ");
            return d;
        },
        addSize = function (val) {
            return val;
        };
    if (container) {
        text.innerHTML = rating;
        text.className = 'text';
        svg.setAttribute('width', addSize(width));
        svg.setAttribute('height', addSize(height));
        circle.setAttribute('cy', addSize(height / 2));
        circle.setAttribute('cx', addSize(width / 2));
        circle.setAttribute('r', addSize(radius - (thickness / 2)));
        circle.setAttribute('stroke', '#e8e8e8');
        circle.setAttribute('stroke-width', addSize(thickness));
        circle.setAttribute('fill', '#ffffff');
        arc.setAttribute('stroke', color);
        arc.setAttribute('stroke-width', addSize(thickness));
        arc.setAttribute('fill', 'rgba(0, 0, 0, 0)');
        arc.setAttribute('stroke-linecap', 'round');
        arc.setAttribute('d', describeArc(width / 2, height / 2, addSize(radius - (thickness / 2)), 0, 359 * rating / 10));
        svg.appendChild(circle);
        svg.appendChild(arc);
        container.appendChild(svg);
        container.appendChild(text);
    }
}

renderRatingReviews({
    container: document.getElementById('elementId')
});