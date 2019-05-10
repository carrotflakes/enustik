import React from 'react';
import PianoRoll from '../containers/PianoRoll';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <button onClick={this.props.play}>play</button>
        <button onClick={this.props.stop}>stop</button>
        <PianoRoll width="600" height="400"/>
      </div>
    );
  }
}
