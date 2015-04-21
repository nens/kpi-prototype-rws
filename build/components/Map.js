/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var cx = React.addons.classSet;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
require("!style!css!./KPIApp.css");
require("!style!css!./Colorbrewer.css");

var Row = require('react-bootstrap').Row;
var Accordion = require('react-bootstrap').Accordion;
var Panel = require('react-bootstrap').Panel;
var Grid = require('react-bootstrap').Grid;
var Label = require('react-bootstrap').Label;
var Col = require('react-bootstrap').Col;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;

var Modal = require('react-bootstrap').Modal;
var Badge = require('react-bootstrap').Badge;
var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Table = require('react-bootstrap').Table;
var Promise = require('es6-promise').Promise;

var $ = require('jquery');
var d3 = require('d3');
var Utils = require('./Utils');
var debug = require('debug')('Map.js');
require('../libs/d3.tip.js');

var config = require('../config');

var width = 500, height = 600;
var numberFormat = d3.format(".2f");
var projection = d3.geo.mercator()
       .center([config.lat, config.lon]) // Coords in 3857 projection
       .scale(7000);
var path = d3.geo.path().projection(projection);
var svg;


var Legend = React.createClass({

	render: function() {
		var legendItems = [];

		legendItems.push(<div style={{textAlign:'center',padding:5,backgroundColor:Utils.quantize(0.9).color}}>{Utils.quantize(0.9).label}</div>);
		legendItems.push(<div style={{textAlign:'center',padding:5,backgroundColor:Utils.quantize(0.7).color}}>{Utils.quantize(0.7).label}</div>);
		legendItems.push(<div style={{textAlign:'center',padding:5,backgroundColor:Utils.quantize(0.5).color}}>{Utils.quantize(0.5).label}</div>);
		legendItems.push(<div style={{textAlign:'center',padding:5,backgroundColor:Utils.quantize(0.3).color}}>{Utils.quantize(0.3).label}</div>);
		legendItems.push(<div style={{textAlign:'center',padding:5,backgroundColor:Utils.quantize(0.1).color}}>{Utils.quantize(0.1).label}</div>);

		return (
			<div style={{position:'absolute',left:420,top:410,width:150,height:200}}>
				{legendItems.reverse()}
			</div>
		)
	}

});


var Map = React.createClass({

	getInitialState: function() {
		return {
			LoD: 'stadsniveau'
		};
	},
    componentDidMount: function() {
        var self = this;

		if(self.isMounted()) {

			var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });

	        svg = d3.select(self.refs.map.getDOMNode()).append("svg")
	            .attr("width", width)
	            .attr("height", height);


	        d3.json('static/data/' + config.cityGeojsonFile, function(json) {
	        	self.setState({
	        		features: json.features
	        	});
	            json.features.map(function(feature) {
	                feature.key = feature.properties.owmident;
	                svg.call(tip);
	                svg.append("path")
		                .datum(feature)
		                .attr("d", path)
		                .attr("class", 'stadsdeel ' + feature.properties.owmnaam)
		                .style("stroke", function() { return "white"; })
		                .style("cursor", function() { return "pointer"; })
		                .style("stroke-width", function() { return 1.2; })
		                .on("mouseover", function(e){ 
		                	if(feature.properties.owmnaam !== config.cityName) tip.show(feature.properties.owmnaam);
		                })
		                .on("mouseout", function(e){
		                    tip.hide();
		                })
		                .on('click', function() {
		                	self.props.selectStadsdeel(feature.properties.owmident);
		                    // self.props.selectStadsdeel(feature.properties.owmnaam);
		                });
	            });
	        }); 	           	
        }        
    },
    render: function() {
    	var self = this;

		if(self.isMounted()) {

	    	var perGebied = self.props.perGebied;
			var map = d3.select(self.refs.map.getDOMNode().getElementsByTagName('svg')[0]);

			// Color me grey by default
    		map.selectAll('path')
    			.attr('fill', function(d) {
    				return Utils.quantize(0).color;
    			});

    		// If areas prop is given, color by last value
	    	if(perGebied) {
	    		var area = map.selectAll('path')
	    			.data(perGebied, function(d) {
	    				// console.log('d', d);
	    				return d.key;
	    			})
	    			.attr('fill', function(d) {
	    				var quantizeValue = d.values[d.values.length - 1].Score || d.values[d.values.length - 1].Value;
	    				if(self.props.stadsdeel === config.cityName) {
							return Utils.quantize(quantizeValue).color;
	    				} else if (d.key === self.props.stadsdeel) {
	    					return Utils.quantize(quantizeValue).color;
	    				} else {
	    					return '#ccc';
	    				}
	    			});

				var labels = map.selectAll("text")
	    			.data(perGebied, function(d) {
	    				return d.key;
	    			})
	    			.text(function(d) {
	    				var values = d.values.filter(function(item) {
	    					if(item.Value != 'NULL') return item;
	    				});
	    				if(values[values.length - 1].Score) {
		    				return Number((values[values.length - 1].Score));
	    				} else {
	    					return Number((values[values.length - 1].Value));
	    				}
	    			});
		    }
	    }


	    var formattedActiveSelection = (self.props.activeSelection) ? Utils.truncate(self.props.activeSelection, 30) : '';
        return (
    	    <div style={{position:'fixed'}}>
	            <div id="map" className="map" ref="map" style={{marginTop:50, position:'fixed'}}/>
	            <Label style={{position:'fixed',marginTop:10,fontSize:'1.1em'}}>
	            	Geselecteerd: {this.props.stadsdeel||config.cityName}{self.props.activeSelection ? ' / ' : ''}{formattedActiveSelection}
	        	</Label>
	        	<Legend/>
            </div>
        )
    }
});

module.exports = Map;