/**
 * @jsx React.DOM
 */

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

var Row = require('react-bootstrap').Row;
var Grid = require('react-bootstrap').Grid;
var Col = require('react-bootstrap').Col;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;

var OverlayMixin = require('react-bootstrap').OverlayMixin;
var Modal = require('react-bootstrap').Modal;
var Badge = require('react-bootstrap').Badge;
var Label = require('react-bootstrap').Label;
var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Table = require('react-bootstrap').Table;
var DateTimePicker = require('react-widgets').DateTimePicker;
var Promise = require('es6-promise').Promise;

var $ = require('jquery');
var moment = require('moment');

var Calendar = require('react-calendar').Calendar;
var Day = require('react-calendar').Day;
var Month = require('react-calendar').Month;
var Week = require('react-calendar').Week;

var debug = require('debug');
var bootstrapDebug = debug('LizardApp:bootstrap');

var KPIApp = require('./components/KPIApp');
var BiologieApp = require('./components/BiologieApp');
var ChemieApp = require('./components/ChemieApp');
var EcologieApp = require('./components/EcologieApp');
var EindoordeelApp = require('./components/EindoordeelApp');


var iconTevredenheid = require('./images/icon-tevredenheid.png');
var iconToestand = require('./images/icon-toestand.png');
var iconOmgeving = require('./images/icon-omgeving.png');
var iconGebruik = require('./images/icon-gebruik.png');
var iconPlanning = require('./images/icon-planning.png');

var Utils = require('./components/Utils');
var config = require('./config');

debug.enable('*');

React.initializeTouchEvents(true);

window.React = React; // React DevTools won't work without this
window.period = {'years':5};

var tevredenheidValue, planrealisatieValue, toestandValue, omgevingValue, gebruikValue = 0;


var App = React.createClass({
  getInitialState: function() {
  	return {
      'pis': [],
  		'currentDate': 5
  	};
  },
  selectNewDate: function(date) {
  	window.period.years = date;
  	this.setState({
  		'currentDate': date
  	});
  },
  componentDidMount: function() {
    var self = this;
      d3.csv("static/data/KPI.csv", function (csv) {

          // Format the csv (parse month/year to better date etc)
          csv.map(function(d) {
              d.Date = moment(d.Date, 'MMM/YY').format('MM/DD/YYYY');
              d.month = moment(d.Date).month() + 1; // Zero-based!
          });

          // Group the data by PI
          var data = d3.nest()
              .key(function(d) { return d.KPI; })
              .entries(csv);

          var pisArray = data.map(function(obj) {
              var values = obj.values.filter(function(item) {
                if(item.Value != 'NULL') return item;
              });

              return {
                  'key': obj.key, 
                  'value': values[values.length - 1].Value
              };
          });
          self.setState({'pis': pisArray});
    });

  },
  render: function () {
    var self = this;

    if(self.isMounted()) {
      tevredenheidValue = _.where(self.state.pis, {key: "TEVREDENHEID"})[0].value;
      planrealisatieValue = _.where(self.state.pis, {key: "PLANREALISATIE"})[0].value;
      toestandValue = _.where(self.state.pis, {key: "TOESTAND"})[0].value;
      omgevingValue = _.where(self.state.pis, {key: "OMGEVING"})[0].value;
      gebruikValue = _.where(self.state.pis, {key: "GEBRUIK"})[0].value;
    }
    
    return (
          <div className="">
            <div className="container-full subHeadWrapper">
              <Grid className="">
                  <Row className="subHead">
                    <Col xs={0} md={6}>
                      <a href="./index.html" className="home"><h2 style={{fontFamily:'Geogroteque-Light'}}><strong>{config.dashboardName}</strong> KPI Dashboard</h2></a>
                    </Col>
                    <Col xs={6} md={6} className="period-selection">
                    	<PeriodSelection 
                    		selectNewDate={this.selectNewDate} 
                    		currentDate={this.state.currentDate} />
                    </Col>               
                  </Row>
                </Grid>
              </div>
              <Grid>
              	<Row>
              		<Col xs={12} md={12}>
        						<div id="brandcarouselshadow" className="fullwidthshadow">
        							<div id="globaloverviewbrandscontainer">
        								<ul id="brandcarousel">
                          <li id="omgeving">
                            <Link to="eindoordeel">
                              <img src={iconOmgeving} alt="Omgeving" className="kpi-icon" />
                              &nbsp;Eindoordeel
                              <Label style={{position:'relative',top:'-5px !important',right:'-5px !important',backgroundColor:Utils.quantize(omgevingValue)}}>
                                {Math.round(omgevingValue)}
                              </Label>
                            </Link>
                          </li>                        
                          <li id="planning">
                            <Link to="chemie">
                              <img src={iconPlanning} alt="Planning" className="kpi-icon" />
                              &nbsp;Chemie
                              <Label style={{position:'relative',top:'-5px !important',right:'-5px !important',backgroundColor:Utils.quantize(planrealisatieValue)}}>
                                {Math.round(planrealisatieValue)}
                              </Label>
                            </Link>
                          </li>
                          <li id="toestand">
                            <Link to="ecologie">
                              <img src={iconToestand} alt="Toestand" className="kpi-icon" />
                              &nbsp;Ecologie
                              <Label style={{position:'relative',top:'-5px !important',right:'-5px !important',backgroundColor:Utils.quantize(toestandValue)}}>
                                {Math.round(toestandValue)}
                              </Label>
                            </Link>
                          </li>
        									<li id="tevredenheid">
        										<Link to="biologie">
        											<img src={iconTevredenheid} alt="Biologie" className="kpi-icon" />
        											&nbsp;Biologie
                              <Label style={{position:'relative',top:'-5px !important',right:'-5px !important',backgroundColor:Utils.quantize(tevredenheidValue)}}>
                                {Math.round(tevredenheidValue)}
                              </Label>
        										</Link>
        									</li>
        								</ul>
        							</div>
        						</div>
              		</Col>
              	</Row>
              </Grid>

              <Grid>
              	<Row>
	              	<Col xs={12} md={12}>
	              		<RouteHandler />
	              	</Col>
              	</Row>
              </Grid>
            </div>      
    );
  }
});

var PeriodSelection = React.createClass({
	mixins: [OverlayMixin],
    getInitialState: function () {
      return {
        isModalOpen: false
      };
    },
    getDefaultProps: function() {
    	return {
    		currentDate: 5
    	};
    },
    handleToggle: function () {
      this.setState({
        isModalOpen: !this.state.isModalOpen
      });
    },    	
	handleClick: function (e) {
		swal({
			title: "Nieuwe periode", 
			text: e.target.value + " jaar terug",
			type: 'success',
			timer: 2000
		});
		this.props.selectNewDate(Number(e.target.value));
		this.handleToggle();
	},	
    renderOverlay: function () {
      if (!this.state.isModalOpen) {
        return <span/>;
      }
      return (
          <Modal title="Selecteer een periode" onRequestHide={this.handleToggle}>
            <div className="modal-body">
    			    <div className="well" style={{maxWidth: 400, margin: '0 auto 10px'}}>
    			      <Button 
    			      	bsStyle={this.props.currentDate === 1 ? 'primary' : 'default'} 
    			      	onClick={this.handleClick} 
    			      	bsSize="large" 
    			      	value="1" 
    			      	block>1 jaar terug</Button>
    			      <Button 
    			      	bsStyle={this.props.currentDate === 3 ? 'primary' : 'default'}
    			      	onClick={this.handleClick} 
    			      	bsSize="large" 
    			      	value="3" 
    			      	block>3 jaar terug</Button>
    			      <Button 
    			      	bsStyle={this.props.currentDate === 5 ? 'primary' : 'default'}
    			      	onClick={this.handleClick}
    			      	bsSize="large"
    			      	value="5"
    			      	block>5 jaar terug</Button>
    			    </div>
            </div>
            <div className="modal-footer">
              <Button onClick={this.handleToggle}>Sluiten</Button>
            </div>
          </Modal>
        );
    },	
	render: function() {
		var currentDate = this.props.currentDate;
		var now = moment('2014');
		var formattedDate = now.subtract(currentDate, 'year').format('MMM/YYYY');
		return (
			<div>
			  <ul id="popupbuttons">
				<li id="btn-period" className="hide" style={{cursor:'pointer'}}>
            <i style={{color:'#ccc',margin:'0 5px 0 5px'}} className="fa fa-cog" />
				</li>
				<li id="btn-settings" style={{cursor:'pointer'}}>
            <ModalTrigger modal={<InfoModal />}><i style={{color:'#ccc',margin:'0 5px 0 5px'}} className="fa fa-info" /></ModalTrigger>
				</li>
			  </ul>                    
        <p onClick={this.handleToggle} style={{cursor:'pointer'}}>
        	Periode <span className="period">{formattedDate}</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;<span className="period">Dec/2014</span>	                      	
        </p>
      </div>
		);
	}
});

var InfoModal = React.createClass({
  render: function() {
    var title = config.dashboardName + ' KPI Dashboard';
    return this.transferPropsTo(
        <Modal title={title} animation={true}>
          <div className="modal-body">
            <h3>KPI</h3>
            <p>Een 'Key Performance Indicator' geeft op basis van onderliggende indicatoren inzicht in de prestaties van de waterbeheerder.</p>
            <p>Wilt u meer informatie over de opbouw van een KPI, klik of tap dan op het desbetreffende icoontje.</p>
            <h3>Tijdsperiode</h3>
            <p>Standaard kijkt u naar het afgelopen jaar. Rechtsboven ziet u de actieve periode.</p>
          </div>
          <div className="modal-footer">
            <Button onClick={this.props.onRequestHide}>Sluiten</Button>
          </div>
        </Modal>
      );
  }
});

var BiologieWrapper = React.createClass({
  render: function() {
    return (
      <BiologieApp kpiValue={tevredenheidValue} />
    );
  }
});

var ChemieWrapper = React.createClass({
  render: function() {
    return (
      <ChemieApp kpiValue={planrealisatieValue} />
    );
  }
});

var EcologieWrapper = React.createClass({
  render: function() {
    return (
      <EcologieApp kpiValue={toestandValue} />
    );
  }
});

var EindoordeelWrapper = React.createClass({
  render: function() {
    return (
      <EindoordeelApp kpiValue={omgevingValue} />
    );
  }
});

var KPIWrapper = React.createClass({
  render: function() {
    return (
      <KPIApp />
    );
  }
});


var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="kpi" handler={KPIApp}/>
    <Route name="biologie" handler={BiologieWrapper}/>
    <Route name="chemie" handler={ChemieWrapper}/>    
    <Route name="ecologie" handler={EcologieWrapper}/>
    <Route name="eindoordeel" handler={EindoordeelWrapper}/>
    <DefaultRoute handler={KPIWrapper}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('lizard-app'));
});