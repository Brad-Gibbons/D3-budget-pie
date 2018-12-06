const dims = { height: 300, width: 300, radius: 150};

const cent = {x:(dims.width / 2 + 5), y:(dims.height / 2 + 5)};

const svg = d3.select('.canvas')
            .append('svg')
            .attr('width', dims.width + 150) // 150 is room for legend
            .attr('height', dims.height + 150)

// Group for graph
const graph = svg.append('g')
              .attr('transform', `translate(${cent.x}, ${cent.y})`);

// Pie Graph
const pie = d3.pie()
            .sort(null)
            .value(d => d.cost);


const arcPath = d3.arc()
                .outerRadius(dims.radius)
                .innerRadius(dims.radius/2);

// D3 Scheme to give generated colors
const color = d3.scaleOrdinal(d3['schemeSet3']);
// Update function
const update = (data) => {
    // update color scale
    color.domain(data.map(d => d.name));
    // Create pie chart
    const paths = graph.selectAll('path')
    // join data with dimensions to paths
                        .data(pie(data));
    // handle exit selection
    paths.exit().remove()
    // handle dom path updates
    paths.attr('d', arcPath)
    //
    paths.enter()
         .append('path')
         .attr('class', 'arc')
         .attr('d', arcPath)
         .attr('stroke', '#fff')
         .attr('stroke-width', 3)
         .attr('fill', d => color(d.data.name))
}

// Get data from firestore
// Create variable to store data from db
var data = []
db.collection('expenses').onSnapshot(res => {
    // Cycles through each change from the db
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id};
        console.log(doc)
        switch (change.type) {
            case 'added':
              data.push(doc);
              break;
            case 'modified':
              const index = data.findIndex(item => item.id == doc.id)
              data[index] = doc;
              break;
            case 'removed':
              data = data.filter(item => item.id != doc.id)
              break;
            default:
              break;
          }
    });

    update(data)
})