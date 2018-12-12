import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';

class HeatMap extends Component {
    render() {
        return (
            <Map center={[0,0]} zoom={13} style={{ width: '100%', height: 400 }} >
                <HeatmapLayer
                    fitBoundsOnLoad
                    fitBoundsOnUpdate
                    points={this.props.data}
                    longitudeExtractor={m => m[1]}
                    latitudeExtractor={m => m[0]}
                    intensityExtractor={m => m[2]} 
                    max={0.1}
                />
                <TileLayer
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
            </Map>
        );
    }
}

HeatMap.propTypes = {
    data: PropTypes.array
}

export default HeatMap;