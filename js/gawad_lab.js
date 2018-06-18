
function create_linked_fades_object()  {
	var phylo_tree_selection = d3.selectAll('svg#phylo_tree');
	var gradient_name_selection = d3.selectAll('svg#gradient_name');
	phylo_tree_obj = phylo_tree(phylo_tree_selection);
	console.log("############\n################\n##############\nARGH\n###########\n###########");
	gradient_name_obj = gradient_name(gradient_name_selection);
	phylo_tree_obj.set_target_node_count(20);
	phylo_tree_obj.set_run_time(1000);
	gradient_name_obj.set_time_delay(1000);
	gradient_name_obj.set_run_time(375);
	function execute_masthead_animation()  {
		phylo_tree_obj = phylo_tree(phylo_tree_selection);
		phylo_tree_obj.run_simulation();
		gradient_name_obj.run_gradient();
		fade_element(d3.select("#navBarLabName"));
	}
	function move_title_to_navbar()  {
		gradient_name_obj.run_reverse_gradient();
		show_element(d3.select("#navBarLabName"));
	}
	return({execute_masthead_animation:execute_masthead_animation, move_title_to_navbar:move_title_to_navbar});

}


function fade_element(selection_to_fade)  {
  selection_to_fade
		.transition()
		.delay(500)
		.duration(375)
		.style('opacity', 0);
}

function show_element(selection_to_show)  {
  selection_to_show
		.transition()
		.delay(500)
		.duration(375)
		.style('opacity', 1);
}


function gradient_name(svg)  {
	var time_delay = 1000;
	var run_time = 375;
	var svg = svg;

	function set_time_delay(time_delay)  {
		time_delay = time_delay;
	}

	function set_run_time(run_time)  {
		run_time = run_time;
	}

	function run_gradient()  {
		svg.select("#upper_boundary")
			.transition() 
			.delay(time_delay)
			.duration(run_time)
			.ease(d3.easeLinear)
			.attr('offset', '0%');
		svg.select("#lower_boundary")
			.transition() 
			.delay(time_delay)
			.duration(run_time)
			.ease(d3.easeLinear)
			.attr('offset', '0%');
	}

	function run_reverse_gradient()  {
		svg.select("#upper_boundary")
			.transition() 
			.delay(time_delay)
			.duration(run_time)
			.ease(d3.easeLinear)
			.attr('offset', '100%');
		svg.select("#lower_boundary")
			.transition() 
			.delay(time_delay)
			.duration(run_time)
			.ease(d3.easeLinear)
			.attr('offset', '100%');
	}
	return({set_run_time:set_run_time, set_time_delay:set_time_delay, run_gradient:run_gradient, run_reverse_gradient:run_reverse_gradient});
}

/*function execute_masthead_animation()  {
	console.log("FOO!!!");
	var phylo_tree_selection = d3.selectAll('svg#phylo_tree');
	var gradient_name_selection = d3.selectAll('svg#gradient_name');
	phylo_tree_obj = phylo_tree(phylo_tree_selection);
	console.log("############\n################\n##############\nARGH\n###########\n###########");
	gradient_name_obj = gradient_name(gradient_name_selection);
	phylo_tree_obj.set_target_node_count(20);
	phylo_tree_obj.set_run_time(1000);
	phylo_tree_obj.run_simulation();
	gradient_name_obj.set_time_delay(1000);
	gradient_name_obj.set_run_time(375);
	gradient_name_obj.run_gradient();
	d3.select("#mainLabName").style('opacity', 1);
	console.log("############\n################\n##############\nARGH\n###########\n###########");
	fade_element(d3.select("#navBarLabName"));

  //debugger;
	phylo_tree_selection.select("#upper_boundary")
		.transition() 
		.delay(1000)
		.duration(1000)
		.ease(d3.easeLinear)
		.attr('offset', '0%');
	phylo_tree_selection.select("#lower_boundary")
		.transition() 
		.delay(1000)
		.duration(1000)
		.ease(d3.easeLinear)
		.attr('offset', '0%');
	console.log("HEEEELLLLLLO!?!?!?!?");
}

*/

var linked_fades = create_linked_fades_object();

(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 54)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

  // Collapse Navbar
  var navbarCollapse = function() {
		var main_nav = $("#mainNav");
    if (main_nav.offset().top > 100) {
			if(!main_nav.hasClass('navbar-shrink'))  {
				main_nav.addClass("navbar-shrink");
				linked_fades.move_title_to_navbar();
			}
    } else {
			if(main_nav.hasClass('navbar-shrink'))  {
				console.log("executing masthead animation!");
				linked_fades.execute_masthead_animation();
			}
      main_nav.removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);


  // Hide navbar when modals trigger
  $('.portfolio-modal').on('show.bs.modal', function(e) {
    $(".navbar").addClass("d-none");
  })
  $('.portfolio-modal').on('hidden.bs.modal', function(e) {
    $(".navbar").removeClass("d-none");
  })
  console.log("wtf!!");
})(jQuery); // End of use strict

window.onload = function() {
	linked_fades.execute_masthead_animation();
  console.log("ARGH!")
  $('#publications_carousel').slick(
    {
			arrows: true,
			centerMode: true,
			centerPadding: '60px',
      dots:true,
      speed: 500,
			infinite: true,
      slidesToShow: 3
    }
  );
  console.log("ARGH!")
}
