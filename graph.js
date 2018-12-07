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

// Legend 
const legendGroup = svg.append('g')
                        .attr('transform', `translate(${dims.width + 50}, 10)`)

const legend = d3.legendColor()
                 .shape('circle')
                 .scale(color)
                 .shapePadding(10)


// TOOL TIP
const tip = d3.tip()
              .attr('class', 'tip card')
              .html(d => {
                  return `<div class="name">
                            <p>${d.data.name}</p>
                          </div>
                          <div class="cost">
                            <p>$${d.data.cost}</p>
                          </div>
                          <div class="delete">
                            <p>Click to delete</p>
                          </div>`
              })
// attch
graph.call(tip)
// Update function
const update = (data) => {
    // update color scale
    color.domain(data.map(d => d.name));
    // call legend with new data
    legendGroup.call(legend)
    legendGroup.selectAll('text').attr('fill', 'white')
    // Create pie chart
    const paths = graph.selectAll('path')
    // join data with dimensions to paths
                        .data(pie(data));
    // handle exit selection
    paths.exit()
            .transition().duration(1000)
            .attrTween('d', arcTweenExit) 
            .remove()
    // handle dom path updates
    paths.attr('d', arcPath)
         .transition().duration(1000)
         .attrTween('d', arcTweenUpdate)
    //
    paths.enter()
         .append('path')
         .attr('class', 'arc')
         .attr('d', arcPath)
         .attr('stroke', '#fff')
         .attr('stroke-width', 3)
         .attr('fill', d => color(d.data.name))
         // Allows us to perform function on each element applys prop of current equal to the data of each iteration 
         .each(function(d){ this._current = d })
         .transition().duration(1000)
            .attrTween('d', arcTweenEnter)

    // Event listeners
    graph.selectAll('path')
         .on('mouseover', (d, i, n) => {
             tip.show(d, n[i]);
             handleMouseOver(d,i,n);
         })
         .on('mouseout', (d, i, n) => {
             tip.hide(d, n[i])
             handleMouseOut(d,i,n);
         })
         .on('click', handleClick)
}

// Get data from firestore
// Create variable to store data from db
var data = []
db.collection('expenses').onSnapshot(res => {
    // Cycles through each change from the db
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id};
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
});
// Event handlers
const handleMouseOver = (d, i, n) => {
    d3.select(n[i])
       .transition('changeSliceFill').duration(300)
            .attr('fill', 'white')
}
const handleMouseOut = (d, i, n) => {
    d3.select(n[i])
       .transition('changeSliceFill').duration(300)
            .attr('fill', color(d.data.name))
}
const handleClick = (d) => {
    const id = d.data.id;

    db.collection('expenses').doc(id).delete();
}


const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function(t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
}

const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function(t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
}

//use function for use of 'this'
function arcTweenUpdate(d) {
    // calculate between two objects starting angle & finishing angle
    var i = d3.interpolate(this._current, d);
    // update the current prop with new calc 
    this._current = i(1);

    return function(t) {
        return arcPath(i(t))
    }
}