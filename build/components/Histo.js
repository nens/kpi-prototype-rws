/**
 * @jsx React.DOM
 */

var React = require('react/addons');
var cx = React.addons.classSet;

var moment = require('moment');
var Router = require('react-router');
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

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

var Utils = require('./Utils');

var $ = require('jquery');
var d3 = require('d3');
require('../libs/d3.tip.js');

var debug = require('debug')('Histo.js');
var startYear;

var Histo = React.createClass({
    toggleGraph: function() {
        if(this.state.chartType === 'pi') {
            this.setState({chartType: 'real'});
        } else {
            this.setState({chartType: 'pi'});
        }
    },
    getInitialState: function() {
        var refval;
        if(localStorage.getItem(this.props.title)) {
            refval = localStorage.getItem(this.props.title);
        } else {
            localStorage.setItem(this.props.title, 50);
            refval = localStorage.getItem(this.props.title);
        }
        return {
            selected: false,
            referenceValue: refval,
            chartType: 'pi' // Can be 'pi' or 'real'
        };
    },
    handleReferenceValueChange: function(e) {
        debug(e.target.value);
        localStorage.setItem(this.props.title, e.target.value);
        this.setState({
            referenceValue: e.target.value
        });
    },
    handleHistoClick: function() {
        var self = this;
        self.props.handleSelection({
            'title': self.props.title,
            'selected': !self.state.selected
        });        

        if(self.props.active) {
            self.setState({selected: false});
        } else {
            self.setState({selected: true});
        }
    },
    render: function() {

        var self = this;
        var count = this.props.key;
        var title = this.props.title;
        var chartType = this.state.chartType;
        var values = this.props.values;
        var period = this.props.period;
        var referenceValue = this.state.referenceValue;
        var line, lastValue;
        var tooltipString = '';

        // if(values[values.length - 1].Value === 'NULL') {
        //     // Last value is NULL... do not draw this chart!
        //     return <div style={{display:'none'}} />;
        // }


        if(chartType === 'real') {
            lastValue = (values[values.length - 1].Abs) || 0;
            tooltipString = 'Aantal';
        } else {
            try {
              lastValue = (values[values.length - 1].Score) || 0;  
            } catch(e){
              lastValue = 0;
            }
            
            tooltipString = '';
        }
       


        // D3 configuration
        var margin = {top: 20, right: 20, bottom: 60, left: 50},
            width = 500 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%m/%d/%Y").parse;

        if(period) {
            startYear = moment('2014').subtract(period, 'years');    
        } else {
            startYear = moment('2014').subtract(5, 'years');    
        }
        
        d3.select('#'+title.replace(/ /g, '-')).select('svg').remove(); // This should not be necessary, break up d3 into smaller components?

        // Dynamic SVG element creation
        var svg = d3.select('#'+title.replace(/ /g, '-')).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        // Scale and domain setup
        // 

        var x = d3.time.scale()
            .range([0, width])
            .domain([moment('1-1-2009').toDate(), moment('12-31-2014').toDate()]).clamp(true);

            // debugger;

        var y = d3.scale.linear()
            .range([height, 1])
            .domain([-0.1, 1]);


        // Axis setup
        var xAxis = d3.svg.axis()
            .scale(x)
            .tickFormat(d3.time.format("%Y"))
            .tickPadding(12)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");


        // Line element configuration
        line = d3.svg.line()
            .defined(function(d) { return d.Score != 'NULL'; })
            .x(function(d) { return x(parseDate(d.Date)); })
            .y(function(d) { return y(Number(d.Score)); });


        // Appending x axis
        var xaxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        xaxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "3em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                // return "rotate(-65)";
            });

        // Appending y axis
        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .text("")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");


          svg.append("rect")
              .attr("class", "overlay")
              .attr("width", width)
              .attr("height", height)
              .on("mouseover", function() {
                focus.style("display", null); 
              })
              .on("mouseout", function() {
                focus.style("display", "none");
              })
              .on("mousemove", mousemove);

        svg.selectAll("bar")
            .data(values)
          .enter().append("rect")
            .style("fill", "steelblue")
            .attr("x", function(d) {
              return x(parseDate(d.Date)) - .5;
            })
            .attr("width", 70)
            .attr("y", function(d) {
              return y(d.Score);
            })
            .on('click', self.props.handleSetYear)
            .attr("height", function(d) { return height - y(d.Score); });

        
          var bisectDate = d3.bisector(function(d) {
            return parseDate(d.Date);
          }).left;

          var focus = svg.append("g")
              .attr("class", "focus")
              .style("display", "none");

          focus.append("circle")
              .attr("r", 4.5);

          focus.append("text")
              .attr("x", 9)
              .attr("dy", ".35em");



          function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(values, x0, 1),
                d0 = values[i - 1],
                d1 = values[i];

            var d;
            try {
               d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
            } catch(error) {
               d = d1;
            }

            try {
              focus.attr("transform", "translate(" + (x(parseDate(d.Date))+30) + "," + y(d.Score) + ")");
              focus.select("text").text(d.Score);                            
            } catch(error) {
              var error;
            }

          }

        var max = d3.max(values, function(d) { return Number(d.Abs); });

        if(self.state.referenceValue && chartType === 'real') {
            svg.append('line')
                .attr({
                    x1: xAxis.scale()(0),
                    y1: yAxis.scale()((self.state.referenceValue * max) / 100),
                    x2: 1000,
                    y2: yAxis.scale()((self.state.referenceValue * max) / 100)
                })
                .style("stroke-dasharray", "5,5")
                .style("stroke", "#000");
        }

        var refval = ((self.state.referenceValue * max) / 100);


        var alarmTxt = '';
        var alarmClass = false;
        if(refval > lastValue) {
          alarmClass = true;
          alarmTxt = 'Onder referentiewaarde'
        } else {
          alarmClass = false;
          alarmTxt = 'Boven referentiewaarde'
        }

        var alarmClasses = cx({
          'danger': alarmClass
        });

        var classesTitlebar = cx({
            'first': self.props.tabIndex === 1,
            'panel-heading': true,
            'rightarrowdiv': self.props.active,
            'active': self.props.active
        });
        var classesContainer = cx({
            'panel': true,
            'panel-default': true,
            'active': self.props.active
        });
        var classesToggleSlider = cx({
            'hide': self.state.chartType === 'pi'
        });

        var bgCol = '#fff';
        var labelCol = '#000';
        if(self.state.chartType === 'pi') {
          bgCol = Utils.quantize(lastValue).color;
          labelCol = Utils.quantize(lastValue).labelColor;
        } else {
          bgCol = '#fff';
        }


        return (
            <div className={classesContainer} ref="histoRoot">

              <div style={{position:'relative'}} className={classesTitlebar}>
                    <OverlayTrigger placement="right" overlay={<Tooltip><strong>{tooltipString}</strong></Tooltip>}>
                        <Label 
                               style={{float:'right', fontSize:'1.1em', cursor: 'pointer', backgroundColor: bgCol, color: labelCol}}>
                               {lastValue} {(self.state.chartType === 'pi') ? '' : ' ('+alarmTxt+')'}
                        </Label>
                    </OverlayTrigger>&nbsp;
                    <span onClick={this.handleHistoClick} 
                          style={{cursor:'pointer', fontWeight:'bold', fontSize:'1.1em'}}>
                          {title}
                    </span>
              </div>
              <div className="panel-body">
                <div className="histoChart" ref="chart" id={title.replace(/ /g, '-')}>
                      <input onChange={this.handleReferenceValueChange} 
                             className={classesToggleSlider}
                             type='range'
                             defaultValue={this.state.referenceValue} 
                             style={{width:159, 
                                     position:'relative', 
                                     top:103, 
                                     left:437,
                                     'WebkitTransform':'rotate(-90deg)',
                                     'MozTransform':'rotate(-90deg)',
                                     transform:'rotate(-90deg)'}} />
                </div>
              </div>
            </div>            
        );
    }
});

module.exports = Histo;