import React from 'react';
import PianoRoll from '../containers/PianoRoll';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.eventListeners = {
      keydown: e => {
        if (e.code === 'KeyZ' && e.ctrlKey && !e.shiftKey && !e.altKey) {
          this.props.undo();
          e.stopPropagation();
        }
        if (e.code === 'KeyZ' && e.ctrlKey && e.shiftKey && !e.altKey) {
          this.props.redo();
          e.stopPropagation();
        }
      }
    };
    for (let key in this.eventListeners) {
      window.addEventListener(key, this.eventListeners[key], {passive: false});
    }
  }

  componentWillUnmount() {
    for (let key in this.eventListeners) {
      window.removeEventListener(key, this.eventListeners[key]);
    }
  }


  render() {
    return (
      <div styleName="app">
        <div>
          <button onClick={this.props.play}>play</button>
          <button onClick={this.props.stop}>stop</button>
          <button onClick={this.props.undo}>undo</button>
          <button onClick={this.props.redo}>redo</button>
        </div>
        <PianoRoll width="600" height="400"/>
      </div>
    );
  }
}
