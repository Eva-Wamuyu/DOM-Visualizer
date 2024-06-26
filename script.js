document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('dom-editor');
    const treeContainer = document.getElementById('tree-container');

    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const updateTree = () => {

        treeContainer.innerHTML = '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = editor.value;

        const buildHierarchy = (element) => {
            let nodeName = element.tagName.toLowerCase();
            if (element.id) {
                nodeName += `#${element.id}`;
            }
            if (element.className) {
                nodeName += `.${element.className.trim().replace(/\s+/g, '.')}`;
            }
            return {
                name: nodeName,
                children: Array.from(element.children).map(buildHierarchy)
            };
        };

        const rootElements = Array.from(tempDiv.children).map(buildHierarchy);
        const data = { name: 'root', children: rootElements };

        const margin = { top: 20, right: 90, bottom: 30, left: 90 },
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        const svg = d3.select(treeContainer).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        const tree = d3.tree().size([height, width]);
        const root = d3.hierarchy(data, d => d.children);

        tree(root);

        const link = svg.selectAll('.link')
            .data(root.descendants().slice(1))
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', d => {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

        const node = svg.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')');

        node.append('circle')
            .attr('r', 10)
            .style('fill', d => colors(d.depth));

        node.append('text')
            .attr('dy', '.35em')
            .attr('x', d => d.children ? -13 : 13)
            .style('text-anchor', d => d.children ? 'end' : 'start')
            .text(d => d.data.name);
    };

    editor.addEventListener('input', updateTree);

    updateTree();
});
