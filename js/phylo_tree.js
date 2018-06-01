function phylo_tree(svg) {

  var version = 0.1;
	var svg_width = svg.attr('width');
	var svg_height = svg.attr('height');

	var rate = 1;
	var target_node_count = 25;
	var start_nodes_count = 1;
	var current_time = 0;
	var run_time = 1000;
	var svg_buffer_length = 2;

	//Set up the duplication times
	var dup_times = get_duplication_times(target_node_count);
	//Set up the scales
	var xScale = d3.scalePoint().domain([start_nodes_count-1, start_nodes_count-1]).range([svg_buffer_length, svg_width - svg_buffer_length]); 
	var yScale = d3.scaleLinear().domain([0, run_time]).range([svg_height - svg_buffer_length, svg_buffer_length]); 

	function version()  {
		return(version)
	}

	function set_target_node_count(new_count)  {
		target_node_count = new_count;
		dup_times = get_duplication_times(target_node_count);
		return(target_node_count);
	}

	function set_run_time(new_time)  {
		run_time = new_time;
		yScale.domain([0, run_time])
		dup_times = get_duplication_times(target_node_count);
		return(run_time);
	}

	function get_and_increment_id_function()  {
		var line_id = 0;
		return(function()  {
			line_id += 1;
			return(line_id -1);
		});
	}

	get_num_x_points = function(num_target_nodes) {
		var the_sum = num_target_nodes + 1;
		return(Math.ceil(the_sum * (the_sum/2.0)));
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
		
		time_scale = d3.scaleLinear()
			.domain([0, dup_times[dup_times.length-1][0]])
			.range([0, run_time]);
		for(i=0; i < dup_times.length; i++)  {
			dup_times[i][0] = time_scale(dup_times[i][0]);

		}
		return(dup_times);
	}


	//set up initial point

	//Note that the data coordinates are always in the domain, not in the range of either the xScale or yScale
	//var svg = d3.select('svg')
	//	.attr('width', svg_width)
	//	.attr('height', svg_height);

	/*
	 * This function takes a node index, its duplication time, and the time until the next duplication
	 * */
	function run_phylo_iteration(dup_info, next_dup_time, current_time)  {
		var dup_time = dup_info[0];
		var dup_node = dup_info[1];
		var next_scheduled_dup_time = next_dup_time;
		var remaining_time_until_next_duplication = next_dup_time - current_time;
		console.log('running duplication at ' + current_time);
		console.log('Next dup set for ' + remaining_time_until_next_duplication);
		//var new_xScale = xScale;
		//new_xScale.domain([0,xScale.domain()[1] + 1]);
		
		console.log("############### NEW ITERATION #####################");
		console.log(dup_node);
		
		//console.log([dup_node, dup_time, next_dup_time]);
		
		// 1) Remove line-active class from ancestral branch of duplication 
		var dup_node_index = undefined;
		svg.selectAll('line.line-vertical.line-active')
			.filter(function(d)  {
				console.log(d['active_index']);
				return(d['active_index'] == dup_node)
			})
			//.classed('line-active', false)
			.each(function(d)  {
				dup_node_index = d['x1_index'];
				//d['active_index'] = undefined;
				console.log("Found match to active-index");
			});
		if(dup_node_index == undefined) {
			console.log("DID not find any match to active-index");
		}

		//adjust all horizontal lines


		//update the data in each object
		console.log("dup_node_index:");
		console.log(dup_node_index);
		update_data_of_existing_lines_for_new_coordinate_system(svg, next_scheduled_dup_time, dup_node, dup_node_index, get_and_increment_id);
		//Add new lines/points for new branches
		add_new_lines_to_plot_as_points(svg, dup_time, next_scheduled_dup_time, dup_node_index, dup_node, get_and_increment_id);
		

		var old_domain = xScale.domain();
		old_domain.push(old_domain.length);
		old_domain.push(old_domain.length);
		var new_domain = old_domain;
		xScale.domain(new_domain);

		//Run the transitions
		console.log("ARGHHH!!");
		console.log(next_scheduled_dup_time - current_time);
		run_transitions(svg.selectAll('line'), current_time, next_scheduled_dup_time);

	}



	function run_transitions(lines_selection, current_time, next_dup_time) {
		console.log("domain:");
		console.log(xScale.domain());
		lines_selection
			.transition()
			.duration(next_dup_time - current_time)
			.ease(d3.easeLinear)
			.attr('x1', function(d,i)  {
				return(xScale(d['x1_index']));
			})
			.attr('x2', function(d,i)  {
				return(xScale(d['x2_index']));
			})
			.attr('y2', function(d,i)  {
				return(yScale(d['y2_index']));
			})
			.transition()
			.delay(200)
			.duration(300)
			.ease(d3.easeLinear)
			.style('opacity', 0)
			.remove();

	}

	function adjust_horizontal_coordinates(lines_selection, dup_x_index)  {
		lines_selection
			.selectAll('line.line-vertical')
			.each(function(d,i)  {
				if(d['x1_index'] == dup_x_index)  {
					d['x1_index'] += 1;
					d['x2_index'] += 1;
				}
				else if(d['x1_index'] > dup_x_index)  {
					d['x1_index'] += 2;
					d['x2_index'] += 2;
				}
			});
		lines_selection
			.selectAll('line.line-horizontal')
			.each(function(d,i)  {
				if(d['x1_index'] == dup_x_index)  {
					d['x1_index'] += 1;
				}
				else if(d['x1_index'] > dup_x_index)  {
					d['x1_index'] += 2;;
				}
				if(d['x2_index'] == dup_x_index)  {
					//if(d['x1_index'] < d['x2_index'])  {
				 d['x2_index'] += 1;
					//}
					//else  {

					//}
					//d['x1_index'] += 1;
				}
				else if(d['x2_index'] > dup_x_index)  {
					d['x2_index'] += 2;;
				}
			})
	}

	function adjust_vertical_coordinates(lines_selection, dup_x_active_index, dup_x_index, next_dup_time)  {
		console.log("updating all to");
		console.log(next_dup_time);

		lines_selection
			.selectAll('line.line-vertical.line-active')
			.each(function(d,i)  {
				d['y2_index'] = next_dup_time;
			});
	}

	/*Update data of existing lines so it is relative to the new x-coordinates, but do not update screen positions. This update includes removing the active status from the line at the duuplicated index*/
	function update_data_of_existing_lines_for_new_coordinate_system(svg_selection, next_dup_time, dup_x_active_index, dup_x_index, id_function)  {
		// 2) Update the indices of the existing lines 
		svg_selection 
			.selectAll('line.line-vertical.line-active')
			.each(function(d,i)  {
				if(d['active_index'] > dup_x_active_index)  {
					d['active_index'] += 1;
				}
			})
			.attr('active_index', function(d,i)  {return(d['active_index'])})
			.filter(function(d,i)  {
				return(d['x1_index'] == dup_x_index ? true : false);
			})
			.each(function(d,i)  {
				d['active_index'] = false;
			})
			.classed('line-active', false);
		
		adjust_vertical_coordinates(svg_selection, dup_x_index, dup_x_active_index, next_dup_time);
		adjust_horizontal_coordinates(svg_selection, dup_x_index);
	}

	/*Add the points that will eventually be horizontal and vertical lines. The associated data is based on the updated scales, but is not used for positioning at this stage since the xscale hasn't been updated yet.*/
	function add_new_lines_to_plot_as_points(svg_selection, dup_time, next_dup_time, dup_x_index, dup_x_active_index, id_function)  {
		//Add two new horizontal lines
		svg_selection
			.selectAll('line.line-horizontal')
			.data([{'x1_index': dup_x_index + 1, 'x2_index':dup_x_index, 'y1_index': dup_time, 'y2_index': dup_time, 'id':get_and_increment_id()},{'x1_index': dup_x_index + 1, 'x2_index':dup_x_index + 2, 'y1_index': dup_time, 'y2_index': dup_time, 'id':get_and_increment_id()}], function(d,i)  {return(d['id']);})
			.enter()
			.append('line')
			.classed('line-horizontal', true)
			.attr('x1', xScale(dup_x_index))
			.attr('x2', xScale(dup_x_index))
			.attr('y1', yScale(dup_time))
			.attr('y2', yScale(dup_time))
			.attr('stroke-width', 3)
			.attr('stroke', 'white')
			.attr("id", function(d)  {return(d['id'])});

		svg_selection
			.selectAll('line.line-vertical')
			.data([{'x1_index': dup_x_index, 'x2_index':dup_x_index, 'active_index': dup_x_active_index, 'y1_index': dup_time, 'y2_index': next_dup_time, 'id':get_and_increment_id()},{'x1_index': dup_x_index + 2, 'x2_index':dup_x_index + 2, 'active_index': dup_x_active_index + 1, 'y1_index': dup_time, 'y2_index': next_dup_time, 'id':get_and_increment_id()}], function(d,i)  {return(d['id']);})
			.enter()
			.append('line')
			.classed('line-active', true)
			.classed('line-vertical', true)
			.attr('x1', xScale(dup_x_index))
			.attr('x2', xScale(dup_x_index))
			.attr('y1', yScale(dup_time))
			.attr('y2', yScale(dup_time))
			.attr('active_index', function(d,i)  {d['active_index']})
			.attr('stroke-width', 3)
			.attr('stroke', 'white')
			.attr("id", function(d)  {return(d['id'])});
	}

	function run_simulation()  {
		var points_selection = svg
			.selectAll('line')
			.data([{'x1_index':0, 'x2_index':0, 'y1_index':0, 'y2_index':dup_times[0][0], 'id':get_and_increment_id(), 'active_index':0}], function(d,i)  {return(d['id']);})
			.enter()
			.append('line')
			.classed('line-active', true)
			.classed('line-vertical', true)
			.attr('x1', function(d) {return(xScale(0));})
			.attr('y1', function(d) {return(yScale(0));})
			.attr('x2', function(d) {return(xScale(0));})
			.attr('y2', function(d) {return(yScale(0));})
			.attr('stroke-width', 3)
			.attr('stroke', 'white')
			.attr("id", function(d)  {return(d['id'])});


		//Start animation until first duplication triggers a split
		points_selection
			.transition()
			.ease(d3.easeLinear)
			.duration(function(d)  {return(d['y2_index'])})
			.attr('y2', function(d)  {return(yScale(d['y2_index']))});

		var current_index = 0;
		var evo_timer = d3.timer(function(elapsed_time)  {
	
			if((elapsed_time >= run_time) | (current_index >= target_node_count - 1)) {
				//debugger;
				evo_timer.stop();
			}
			else if(elapsed_time >= dup_times[current_index][0])  {
				//triggered when the current iteration is to be duplcated
				current_index += 1;
				dup_info = dup_times[current_index];
				run_phylo_iteration(dup_times[current_index-1], dup_info[0], elapsed_time);
			}
		});
	}

	return({set_target_node_count, set_run_time, run_simulation});
}
