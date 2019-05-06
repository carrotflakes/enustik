import React from 'react';
import PianoRoll from '../containers/PianoRoll';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PianoRoll width="400" height="400"/>
    );
  }
}
