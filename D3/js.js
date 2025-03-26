
let cities = [
    { name: 'London', population: 8674000},
    { name: 'New York', population: 8406000},
    { name: 'Sydney', population: 4293000},
    { name: 'Paris', population: 2244000},
    { name: 'Beijing', population: 11510000}
];


let data = [
    [{fish: 0, meat: 100, fruit: 250}, {fish: 0, meat: 100, fruit: 250}],
    [{fish: 0, meat: 100, fruit: 250}, {fish: 0, meat: 100, fruit: 250}],
    [{fish: 0, meat: 100, fruit: 250}, {fish: 0, meat: 100, fruit: 250}],
    [{fish: 0, meat: 100, fruit: 250}, {fish: 0, meat: 100, fruit: 250}],
    [{fish: 0, meat: 100, fruit: 250}, {fish: 0, meat: 100, fruit: 250}]
];

// Join cities to rect elements and modify height, width and position
for (let i = 0; i< data.length; i++){
    d3.select('.bars')
        .selectAll('rect')
        .data(data[i])
        .join('rect')
        .attr('height', function(d, i){
            return d.fruit
        })
        .attr('width',  75)
        .attr('x', function(d, i2) {
            return i2 * 75+i*75*7;
        });
}
