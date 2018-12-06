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
// Update function
const update = (data) => {
    console.log(data)
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