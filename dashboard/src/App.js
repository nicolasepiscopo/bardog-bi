import React, { Component } from 'react';
import {DateRangePicker} from 'react-date-range';
import {Modal, Button, Label, Icon, Checkbox, Grid, Segment, Divider} from 'semantic-ui-react';
import moment from 'moment';

import Funnel from './components/Funnel';
import Table from './components/Table';
import Loading from './components/Loading';
import HeatMap from './components/HeatMap';
import Header from './components/Header';
import './App.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const BASE_API_PATH = 'http://localhost:3000/dashboard';
const DEFAULT_START_DATE = moment().subtract(1, 'month');
const DEFAULT_END_DATE = moment();

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      range: {
        input: [{
          startDate: DEFAULT_START_DATE,
          endDate: DEFAULT_END_DATE,
          key: 'selection',
        }],
        conversionFunnel: {
          data: null,
          loading: false
        },
        userExperienceFunnel: {
          data: null,
          loading: false
        },
        registrationsByState: {
          data: null,
          loading: false,
        },
        userStories: {
          data: [],
          loading: false
        }
      },
      rangeCompare: {
        input: [{
          startDate: DEFAULT_START_DATE,
          endDate: DEFAULT_END_DATE,
          key: 'selection',
        }],
        conversionFunnel: {
          data: null,
          loading: false
        },
        userExperienceFunnel: {
          data: null,
          loading: false
        },
        registrationsByState: {
          data: null,
          loading: false,
        },
        userStories: {
          data: [],
          loading: false
        }
      }
    };
  }
  
  componentDidMount () {
    this.requestSources('range');
  }

  cleanKey (key) {
    return key.split('_').join(' ').toUpperCase();
  }

  setFunnels (target, {conversion, user_experience}) {
    this.setState({
      [target]: {
        ...this.state[target],
        conversionFunnel: {
          data: Object.keys(conversion).map(key => ({name: this.cleanKey(key), value: conversion[key]})),
          loading: false
        },
        userExperienceFunnel: {
          data: Object.keys(user_experience).map(key => ({name: this.cleanKey(key), value: user_experience[key]})),
          loading: false
        },
      }
    });
  }

  setRegistrations (target, registrations) {
    this.setState({
      [target]: {
        ...this.state[target],
        registrationsByState: {
          data: registrations.filter(r => !!r.coords).map(({coords: {lat, lng}, qty}) => [
            lat, 
            lng, 
            qty
          ]),
          loading: false
        }
      }
    });
  }

  setUserStories (target, userStories) {
    this.setState({
      [target]: {
        ...this.state[target],
        userStories: {
          data: userStories,
          loading: false
        },
      }
    });
  }

  /**
   * 
   * @param {range|rangeCompare} target 
   */
  requestSources (target) {
    this.setState({
      [target]: {
        ...this.state[target],
        conversionFunnel: {
          data: null,
          loading: true
        },
        userExperienceFunnel: {
          data: null,
          loading: true
        },
        registrationsByState: {
          data: [],
          loading: true,
        },
        userStories: {
          data: [],
          loading: true
        }
      }
    });

    const {startDate, endDate} = this.state[target].input[0];
    const dateRange = '?start_date='+startDate.toISOString()+'&end_date='+endDate.toISOString();

    fetch(BASE_API_PATH + '/funnel' + dateRange).then(response => response.json()).then(this.setFunnels.bind(this, target)).catch(e => console.error(e));
    fetch(BASE_API_PATH + '/user-stories' + dateRange).then(response => response.json()).then(this.setUserStories.bind(this, target)).catch(e => console.error(e));
    fetch(BASE_API_PATH + '/registrations').then(response => response.json()).then(this.setRegistrations.bind(this, target)).catch(e => console.error(e));
  }

  handleOnRangeSelect ({selection: range}) {
    if (Array.isArray(range)) {
      this.setState({
        range: {
          ...this.state.range,
          input: range,
        }
      }, this.requestSources.bind(this, 'range'));
    } else {
      this.setState({
        range: {
          ...this.state.range,
          input: [range],
        }
      }, this.requestSources.bind(this, 'range'));
    }
  }

  handleOnRangeCompareSelect ({selection: rangeCompare}) {
    if (Array.isArray(rangeCompare)) {
      this.setState({
        rangeCompare: {
          ...this.state.rangeCompare,
          input: rangeCompare,
        },
      }, this.requestSources.bind(this, 'rangeCompare'));
    } else {
      this.setState({
        rangeCompare: {
          ...this.state.rangeCompare,
          input: [rangeCompare]
        },
      }, this.requestSources.bind(this, 'rangeCompare'));
    }
  }

  handleOnChangeCompare (evt, {checked: compare}) {
    this.setState({
      compare
    });

    this.requestSources('rangeCompare');
  }

  renderFunnelGraphics (isCompare, twoColumns) {
    const {
      [isCompare ? 'rangeCompare' : 'range']: {
        conversionFunnel, 
        userExperienceFunnel,
        userStories
      }
    } = this.state;

    return (
      <div>
        <Grid stackable columns={twoColumns ? 2 : 1} relaxed>
          <Grid.Column>
            {conversionFunnel.loading ? (
              <Loading kind="funnel" />
            ) : (
              <div>
                <div className="Subtitle">
                  Conversion Funnel
                </div>
                <Funnel {...conversionFunnel} />
              </div>
            )}
          </Grid.Column>
          <Grid.Column>
            {userExperienceFunnel.loading ? (
              <Loading kind="funnel" />
            ) : (
              <div>
                <div className="Subtitle">
                  User Experience Funnel
                </div>
                <Funnel {...userExperienceFunnel} />
              </div>
            )}
          </Grid.Column>
        </Grid>
        <Divider />
        <Grid columns={1} relaxed>
          <Grid.Column>
            {userStories.loading ? (
              <Loading kind="table" />
            ) : (
              <div>
                <div className="Subtitle">
                  Delivered Value
                </div>
                {userStories.data.length ? (
                  <Table
                    header={['id', 'title']}
                    data={userStories.data}
                  />
                ) : (
                  <div>
                    There are no results for this period.
                  </div>
                )}
              </div>
            )}
          </Grid.Column>
        </Grid>
      </div>
    );
  }

  renderDatePicker (value, onChange) {
    return (
      <Modal trigger={(
        <Button icon labelPosition='left'>
          <Icon name='calendar' />
          Date Range
        </Button>
      )} centered={true}>
        <Modal.Header>Select a Date Range</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <div style={{textAlign: 'center'}}>
              <DateRangePicker
                ranges={value}
                onChange={onChange}
              />
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }

  renderDateLabelsColumn (startDate, endDate) {
    return (
      <Grid.Column verticalAlign="middle">
        <Label>
          From
          <Label.Detail>{moment(startDate).format('MMM Do YYYY')}</Label.Detail>
        </Label>
        <Label>
          To
          <Label.Detail>{moment(endDate).format('MMM Do YYYY')}</Label.Detail>
        </Label>
      </Grid.Column>
    );
  }

  render() {
    const {
      compare,
      range,
      rangeCompare
    } = this.state;
    
    return (
      <div className="App">
        <Header />
        <Grid columns={compare ? 1 : 2}>
          {compare ? null : (
            this.renderDateLabelsColumn(range.input[0].startDate, range.input[0].endDate)
          )}
          <Grid.Column textAlign="right">
            {compare ? null : this.renderDatePicker(range.input, this.handleOnRangeSelect.bind(this))}
            <Checkbox toggle label='Compare' onChange={this.handleOnChangeCompare.bind(this)} />
          </Grid.Column>
        </Grid>
        {compare ? (
          <Grid stackable columns={2} relaxed>
            <Grid.Column className="Divider">
              <Segment basic>
                <Grid columns={2}>
                  {this.renderDateLabelsColumn(rangeCompare.input[0].startDate, rangeCompare.input[0].endDate)}
                  <Grid.Column textAlign="right" verticalAlign="middle">
                    {this.renderDatePicker(rangeCompare.input, this.handleOnRangeCompareSelect.bind(this))}
                  </Grid.Column>
                </Grid>
                {this.renderFunnelGraphics(true, false)}
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment basic>
                <Grid columns={2}>
                  {this.renderDateLabelsColumn(range.input[0].startDate, range.input[0].endDate)}
                  <Grid.Column textAlign="right" verticalAlign="middle">
                    {this.renderDatePicker(range.input, this.handleOnRangeSelect.bind(this))}
                  </Grid.Column>
                </Grid>
                {this.renderFunnelGraphics(false, false)}
              </Segment>
            </Grid.Column>
          </Grid>
        ) : (
          this.renderFunnelGraphics(false, true)
        )}              
        <Divider />
        <Grid>
          <Grid.Row>
            <Grid.Column>
              {range.registrationsByState.loading ? (
                <Loading kind="map" />
              ) : (
                <div>
                  <div className="Subtitle">
                    User Registrations Heat Map
                  </div>
                  <HeatMap data={range.registrationsByState.data} />
                </div>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
