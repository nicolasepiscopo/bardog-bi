import React, { Component } from 'react';

import './Header.css';
import logo from '../assets/logo.png';

class Header extends Component {
    render() {
        return (
            <div className="Header">
                <img className="Logo" alt="logo" src={logo} />
                <div className="Title">Business Dashboard</div>
            </div>
        );
    }
}

export default Header;