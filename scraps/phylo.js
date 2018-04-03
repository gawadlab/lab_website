var svg_width = 400;
var svg_height = 500;
var svg_buffer_length = 25;


var rate = 1;
var target_node_count = 200;
var start_nodes_count = 1;
var current_time = 0;
var final_run_prop = 0.05;
var run_time = 3000;

function get_and_increment_id_function()  {
  var line_id = 0;
  return(function()  {
    line_id += 1;
    return(line_id -1);
  });
}

var get_and_increment_id = get_and_increment_id_function();



/*
* Get an array of 2-element arrays equal to the number of target nodes - 1.
* 
* Each 2-element array denotes the index of the duplicated line (element 0)
* and the length of time until the next duplication event.
*/
function get_duplication_times(target_node_count)  {
  var current_time = d3.randomExponential(1 * rate)();
  var dup_times = [[current_time, 0]];
  for(i = 1; i < target_node_count; i++)   {
    //console.log(dup_times);
    var dup_time = d3.randomExponential((i) * rate)();
    var dup_node = Math.floor(d3.randomUniform(0,i)());
    current_time += dup_time;
    dup_times[i] = [current_time, dup_node];
  }
  //var final_dup_time = dup_times[dup_times.length - 1][0] * (1 + final_run_prop);
  //dup_times[dup_times.length-1] = [final_dup_time, undefined];
  //Rescale duplication times to seconds
  
  time_scale = d3.scaleLinear()
    .domain([0, dup_times[dup_times.length-1][0]])
    .range([0, run_time]);
  for(i=0; i < dup_times.length; i++)  {
    dup_times[i][0] = time_scale(dup_times[i][0]);

  }
  return(dup_times);
}

//Set up the duplication times
var dup_times = get_duplication_times(target_node_count);

//Set up the scales
var xScale = d3.scalePoint().domain([start_nodes_count-1, start_nodes_count-1]).range([svg_buffer_length, svg_width - 2 * svg_buffer_length]); 
var yScale = d3.scaleLinear().domain([0, dup_times[dup_times.length - 1][0]]).range([svg_height - 2 * svg_buffer_length, svg_buffer_length]); 

//set up initial point

//Note that the data coordinates are always in the domain, not in the range of either the xScale or yScale
var svg = d3.select('svg')
  .attr('width', svg_width)
  .attr('height', svg_height);

var points_selection = svg
  .selectAll('line')
  .data([{'birth_time':0, 'dup_time':0 , 'id':get_and_increment_id(), 'index':0, 'active_index':0}], function(d,i)  {return(d['id']);})
  .enter()
  .append('line')
  .classed('line-active', true)
  .attr('x1', function(d) {return(xScale(d['index']));})
  .attr('y1', function(d) {return(yScale(d['birth_time']));})
  .attr('x2', function(d) {return(xScale(d['index']));})
  .attr('y2', function(d) {return(yScale(d['dup_time']));})
  .attr('stroke-width', 1)
  .attr('stroke', 'black')
  .attr("id", function(d)  {return(d['id'])})
  .attr("index", function(d)  {return(d['index'])});


/**********************************************************
 * Each iteration begins at a duplication point and a
 * length of time until the next duplication in ms
 *
 * At each iteration, the following must occur:
 *
 * 1) Remove line-active class from ancestral branch of duplication 
 * 2) Update the indices of the existing lines 
 * 3) Insert two new lines at position of old line, but give them updated indices
 * 4) update x scale
 * 4) update all active lines' y coordinates and all lines' x-coordinates
 * 5) transition all lines to new x coordinates and all active lines to new y coordinate.
 *    The transition time for both x and y should be equal.
 **********************************************************/

//Start animation until first duplication triggers a split
points_selection
  .each(function(d)  {d['dup_time'] = dup_times[0][0]})
  .transition()
  .duration(function(d)  {return(d['dup_time'])})
  .attr('y2', function(d)  {return(yScale(d['dup_time']))});


function run_phylo_iteration(dup_node, dup_time, next_dup_time)  {
  //var new_xScale = xScale;
  //new_xScale.domain([0,xScale.domain()[1] + 1]);
  
  console.log("############### NEW ITERATION #####################");
  console.log([dup_node, dup_time, next_dup_time]);
  
  // 1) Remove line-active class from ancestral branch of duplication 
  var dup_node_index = undefined;
  svg.selectAll('line.line-active')
    .filter(function(d)  {return(d['active_index'] == dup_node)})
    .classed('line-active', false)
    .each(function(d)  {
      dup_node_index = d['index'];
      d['active_index'] = undefined;
      console.log("Found match to active-index");
    });
  if(dup_node_index == undefined) {
    console.log("DID not find any match to active-index");
  }

  // 2) Update the indices of the existing lines 
  svg
    .selectAll('line')
    .each(function(d)  {
      if(d['active_index'] > dup_node)  {
        d['active_index'] += 1;
      }
      if(d['index'] < dup_node_index)  {
        d['index'] = d['index'];
      }
      else if(d['index'] == dup_node_index) {
        d['index'] = d['index'] + 1;
      }
      else if(d['index'] > dup_node_index ) {
        d['index'] = d['index'] + 2;
      }
    });


  console.log(dup_node_index);
  // 3) Insert two new lines at position of old line, but give them updated indices
  svg
    .selectAll('line.line-active')
    .data([{'birth_time': dup_time, 'dup_time':next_dup_time, 'id':get_and_increment_id(), 'index':dup_node_index, 'active_index':dup_node},{'birth_time': dup_time, 'dup_time':next_dup_time, 'id':get_and_increment_id(), 'index':dup_node_index + 2, 'active_index':dup_node + 1}], function(d,i)  {return(d['id']);})
    .enter()
    .append('line')
    .classed('line-active', true)
    .each(function(d)  {
      console.log(d);
      console.log(xScale.domain());
      console.log(xScale.range());
    })
    .attr('x1', xScale(dup_node_index))
    .attr('x2', xScale(dup_node_index))
    .attr('y1', function(d)  {return(yScale(d['birth_time']))})
    .attr('y2', function(d)  {return(yScale(d['birth_time']))})
    .attr('stroke-width', 1)
    .attr('stroke', 'black')
    .attr("id", function(d)  {return(d['id'])})
    .attr("index", function(d)  {return(d['index'])});

  var old_domain = xScale.domain();
  old_domain.push(old_domain.length);
  old_domain.push(old_domain.length);
  var new_domain = old_domain;
  xScale.domain(new_domain);

  svg
    .selectAll('line')
    //.transition()
    //.duration(next_dup_time - dup_time)
    .attr('x1', function(d,i)  {
      return(xScale(d['index']));
    })
    .attr('x2', function(d,i)  {
      return(xScale(d['index']));
    })
    .each(function(d)  {
      console.log("Moving line with index " + d['index']  + " to " + xScale(d['index']));
    });

  svg
    .selectAll('line.line-active')
    .each(function(d)  {d['dup_time'] = next_dup_time})
    .transition()
    .ease(d3.easeLinear)
    .duration(yScale(next_dup_time - dup_time))
    .attr('y1', function(d,i)  {
      return(yScale(d['birth_time']))
    })
    .attr('y2', function(d,i)  {
      return(yScale(d['dup_time']));
    });
  }


var current_index = 0;
function duplicate(elapsed_time)  {
  if((elapsed_time >= run_time) | (current_index >= target_node_count - 1)) {
    evo_timer.stop();
  }
  else if(elapsed_time >= dup_times[current_index][0])  {
    current_index += 1;
    dup_info = dup_times[current_index];
    run_phylo_iteration(dup_info[1], dup_times[current_index-1][0], dup_info[0]);
  }
}

var evo_timer = d3.timer(duplicate);

console.log("Duplication times and nodes:");
console.log(dup_times);
