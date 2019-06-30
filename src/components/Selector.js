import React from 'react';
import './Selector.css';

export default class Selector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.items.find(item => item.current) || this.props.items[0],
      show: false
    };
  }

  render() {
    const items = this.props.items.map((item, index) => (
      <div key={index} onClick={() => {
        this.props.onSelect(item);
        this.setState({current: item});}}>
        {item.text}</div>
    ));
    return (
      <div styleName="selector" onClick={() => this.setState({show: !this.state.show})}>
        {this.state.current.text}&nbsp;▼
        <div styleName="list" style={{display: this.state.show ? 'inline-block' : 'none'}}>
          {items}
        </div>
      </div>
    );
  }
}
