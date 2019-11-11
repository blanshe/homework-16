import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 800 - margin.top - margin.bottom

let width = 1000 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  const projection = d3.geoEqualEarth()
  const path = d3.geoPath().projection(projection)


  Promise.all([
    d3.json(require('/data/world.topojson')),
    d3.csv(require('/data/flights.csv')),
    d3.csv(require('/data/airport-codes-subset.csv'))
  ])
    .then(ready)
    .catch(err => console.log('Failed on', err))

    const coordinateStore = d3.map()

  function ready([json, datapoints, coordinateData]) {

      console.log('What is our data?')

  // console.log(json)
  // console.log(countries)

  coordinateData.forEach(d => {
    const name = d.iata_code
    const coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  const countries = topojson.feature(json, json.objects.countries)

  svg.append('path')  
  .datum({type: 'Sphere'})
  .attr('d', path)
  .attr('stroke-width', 1)
  .attr('fill', 'lightblue')

  svg
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'grey')

    svg
    .selectAll('.city')
    .data(coordinateData)
    .enter()
    .append('circle')
    .attr('class', 'city')
    .attr('r', 2)
    .attr('fill', 'white')
    .attr('transform', d => {
      const coords = [d.longitude, d.latitude]
      return `translate(${projection(coords)})`

    })
    svg
    .selectAll('.transit')
    .data(coordinateData)
    .enter()
    .append('path')
    .attr('d', d => {
      const fromCoords = [-74, 40]
      const toCoords = coordinateStore.get(d.iata_code)
      const geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('stroke-linecap', 'round')



}

