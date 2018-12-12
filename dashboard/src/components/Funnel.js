import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import D3Funnel from 'd3-funnel';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

// const OPTIONS = {
//     block: {
//         dynamicHeight: true,
//         minHeight: 15,
//     },
// };

class Funnel extends Component {
    constructor (props) {
        super(props);

        this.id = `funnel${Math.floor(Math.random() * (9999 - 0)) + 0}`;
        this.draw = this.draw.bind(this);
    }

    componentDidMount () {
        const {data} = this.props;

        if (data) {
            this.draw(undefined, data);
        }
    }

    componentWillReceiveProps (newProps) {
        const {data} = newProps;
        const propsAreEqual =  JSON.stringify(data) === JSON.stringify(this.props.data);
        
        if (!propsAreEqual) {
            this.draw(undefined, data);
        }
    }

    // componentWillUnmount () {
    //     window.removeEventListener("resize", this.draw);
    // }

    componentWillUnmount() {
      if (this.chart) {
        this.chart.dispose();
      }
    }

    draw (evt, data) {
        if (!data) {
            data = this.props.data;
        }

        // const chart = new D3Funnel(`#${this.id}`);
        // chart.draw(data, OPTIONS);

        this.chart = am4core.create(this.id, am4charts.SlicedChart);
        this.chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

        this.chart.data = data.filter(({value}) => !!value);

        let series = this.chart.series.push(new am4charts.FunnelSeries());
        series.colors.step = 2;
        series.dataFields.value = "value";
        series.dataFields.category = "name";
        series.alignLabels = true;

        series.labelsContainer.paddingLeft = 15;
        series.labelsContainer.width = 200;

        //series.orientation = "horizontal";
        series.bottomRatio = 0.5;

        this.chart.legend = new am4charts.Legend();
        this.chart.legend.position = "left";
        this.chart.legend.valign = "bottom";
        this.chart.legend.margin(5,5,20,5);
    }

    render() {
        return (
            <div className="Funnel">
                <div id={this.id} style={{ width: "100%", height: "500px" }} />
            </div>
        );
    }
}

Funnel.propTypes = {
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    data: PropTypes.object
}

export default Funnel;