import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


const projection = d3.geoAlbersUsa()

// out geoPath needs a PROJECTION variable
const path = d3.geoPath().projection(projection)

d3.json(require('/data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
   console.log(json.objects)
  const counties = topojson.feature(json, json.objects.us_counties)

  const colorScale = d3
  .scaleSequential(d3.interpolatePiYG)

  const opacityScale = d3.scaleLinear().domain([0, 80000]).range([0,1]).clamp(true)

  // Not sure how to do scale/center/etc?
  // Just use .fitSize to center your map
  // and set everything up nice
  projection.fitSize([width, height], counties)

  svg
    .selectAll('.state')
    .data(counties.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('stroke', 'none')
    .attr('fill', function(d){
      if (!d.properties.state) {
        return 'lightgrey'
      } else {
      const percent = d.properties.trump / (d.properties.trump + d.properties.clinton)
      return colorScale(percent)
      }
    })
    .attr('opacity', function(d) {
      const total = d.properties.trump + d.properties.clinton
      return opacityScale(total)
    })

}

