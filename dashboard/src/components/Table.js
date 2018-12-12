import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Table.css';

class Table extends Component {
    state = {  };

    render() {
        const {header, data} = this.props;

        return (
            <table className="Table" cellPadding={0} cellSpacing={0} border={0}>
              <thead>
                <tr>
                    {header.map(title => (
                        <th>{title}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                  {data.map(row => (
                    <tr>
                        <td width="20%">
                            <a href={row.url} rel="noopener noreferrer" target="_blank">
                                {row.id}
                            </a>
                        </td>
                        <td width="80%">
                            {row.title}
                        </td>
                    </tr>
                  ))}
              </tbody>
            </table>
        );
    }
}

Table.propTypes = {
    data: PropTypes.array
}

Table.defaultProps = {
    data: []
}

export default Table;