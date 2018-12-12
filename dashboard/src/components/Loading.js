import React, { Component } from 'react';
import {Loader} from 'semantic-ui-react';
import './Loading.css';

class Loading extends Component {
    render() {
        return (
            <div className="Loading">
                <Loader active inline='centered'/>
            </div>
        );
    }
}

export default Loading;