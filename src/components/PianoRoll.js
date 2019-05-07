import React from 'react';
import './PianoRoll.css';
import { resolution } from '../consts';

export default class PianoRoll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widthScale: 24 * 3,
      heightScale: 6 * 3,
      scrollX: 0,
      scrollY: 0,
      mode: null,
      event: null,
      movingEvent: null,
      tool: 'note',
      durationUnit: {n: 1, d: 4}
    };
    this.svg = React.createRef();
  }

  componentDidMount() {
    console.log('mount');
    this.eventListeners = {
      mouseup: this.onMouseUp.bind(this),
      mousemove: this.onMouseMove.bind(this),
      touchend: touchEventWrap(this.onMouseUp).bind(this),
      touchmove: touchEventWrap(this.onMouseMove).bind(this),
      touchcancel: touchEventWrap(this.onMouseUp).bind(this),
    };
    for (let key in this.eventListeners) {
      window.addEventListener(key, this.eventListeners[key], {passive: false});
    }
    //this.svg.current.addEventListener('touchmove', touchEventWrap(this.onMouseMove).bind(this), {passive: false});
  }

  componentWillUnmount() {
    console.log('unmount');
    for (let key in this.eventListeners) {
      window.removeEventListener(key, this.eventListeners[key]);
    }
  }

  onChange(e) {
    this.setState({
      ...this.state,
      message: e.target.value
    });
  }

  onMouseDown(e) {
    const {x, y} = getPosition(e, this.svg.current);
    switch (this.state.tool) {
      case 'note': {
        const {notenum, tick} = this.notePosition({x, y});
        const {durationUnit: {n, d}} = this.state;
        this.setState({
          mode: 'putting',
          event: {
            id: -1,
            notenum,
            start: tick,
            duration: resolution * n / d
          }
        });
        return false;
      }
      case 'move': {
        const {notenum, tick} = this.notePosition({x, y});
        const [event] = this.props.events.filter(
          event => event.notenum === notenum &&
                 event.start <= tick &&
                 tick <= event.start + event.duration);
        if (event) {
          this.setState({
            mode: 'moving',
            movingEvent: {...event}
          });
        }
        return false;
      }
      case 'remove': {
        const {notenum, tick} = this.notePosition({x, y});
        const [event] = this.props.events.filter(
          event => event.notenum === notenum &&
                 event.start <= tick &&
                 tick <= event.start + event.duration);
        if (event) {
          this.props.removeEvent(event.id);
        }
        return false;
      }
      case 'scroll': {
        this.setState({
          mode: 'scrolling',
          scroll: {x, y}
        });
        return false;
      }
    }
  }

  onMouseMove(e) {
    switch (this.state.mode) {
      case 'putting': {
        const {notenum, tick} = this.notePosition(getPosition(e, this.svg.current));
        const {durationUnit: {n, d}} = this.state;
        const event = this.state.event;
        this.setState({
          event: {
            ...event,
            duration: Math.max(resolution * n / d, tick - event.start + resolution * n / d)
          }
        });
        e.preventDefault();
        return false;
      }
      case 'moving': {
        const {notenum, tick} = this.notePosition(getPosition(e, this.svg.current));
        this.props.moveNote({
          id: this.state.movingEvent.id,
          notenum,
          start: tick
        });
        e.preventDefault();
        return false;
      }
      case 'scrolling': {
        const {x, y} = getPosition(e, this.svg.current);
        const {scrollX, scrollY, scroll} = this.state;
        const newScrollX = -clamp(-(scrollX + x - scroll.x), 0,
                                  this.state.widthScale * 100 - (this.props.width-25));
        const newScrollY = -clamp(-(scrollY + y - scroll.y), 0,
                                  this.state.heightScale * 128 - (this.props.height-20));
        this.setState({
          scrollX: newScrollX,
          scrollY: newScrollY,
          scroll: {x: scroll.x + newScrollX - scrollX, y: scroll.y + newScrollY - scrollY}
        });
        e.preventDefault();
        return false;
      }
    }
  }

  onMouseUp(e) {
    const {x, y} = getPosition(e, this.svg.current);
    switch (this.state.mode) {
      case 'putting': {
        this.props.addNote(this.state.event);
        this.setState({
          mode: null,
          event: null
        });
        return false;
      }
      case 'moving':
      case 'scrolling': {
        this.setState({
          mode: null,
          scroll: null
        });
        return false;
      }
    }
  }

  notePosition({x, y}) {
    x -= this.state.scrollX;
    y -= this.state.scrollY;
    const {durationUnit: {n, d}} = this.state;
    return {
      notenum: 128 - (y / this.state.heightScale | 0),
      tick: ((x - 25) * d / n / this.state.widthScale | 0) * n / d * resolution
    };
  }

  render() {
    const note = event => {
      return <rect x={event.start * this.state.widthScale / resolution}
                   y={(127 - event.notenum) * this.state.heightScale}
                   width={event.duration * this.state.widthScale / resolution - 1}
                   height={this.state.heightScale - 1}
                   key={event.id}
                   fill="#F66"/>;
    }
    const notes = this.props.events.map(note);
    this.state.event && notes.push(note(this.state.event));
    const {width, height} = this.props;
    const piano = Array(128).fill(0).map(
      (x, i) => <rect x="0" y={this.state.heightScale * (127 - i)}
                      width="24"
                      height={this.state.heightScale - 1}
                      fill={['#DDD', '#777']["010100101010"[i%12]]}
                      key={i}/>);

    const pianoMarks = Array(11).fill(0).map(
      (x, i) => <text x="2" y={this.state.heightScale * ((10 - i) * 12 + 8) - 3}
                      fontFamily="Verdana" fontSize="12"
                      stroke="#AAA"
                      key={i}>C{i-1}</text>);

    const tickMarks = Array(100 / 4).fill(0).map(
      (x, i) => <text x={i * 4 * this.state.widthScale} y={18}
                      fontFamily="Verdana" fontSize="12"
                      stroke="#AAA"
                      key={i}>{i+1}</text>);

    const hLines = Array(129).fill(0).map(
      (x, i) => <line x1={0} y1={i * this.state.heightScale}
                      x2={10000} y2={i * this.state.heightScale}
                      stroke={(i+4) % 12 ? '#DDD' : '#AAA'}
                      key={i}/>);
    const vLines = Array(100).fill(0).map(
      (x, i) => <line x1={i * this.state.widthScale} y1={0}
                      x2={i * this.state.widthScale} y2={10000}
                      stroke={i % 4 ? '#DDD' : '#AAA'}
                      key={i}/>);

    return (
      <div>
      <div styleName="tools">
      <div onClick={() => this.setState({tool: 'note'})}
           styleName={this.state.tool === 'note' ? 'active' : ''}>note</div>
      <div onClick={() => this.setState({tool: 'move'})}
           styleName={this.state.tool === 'move' ? 'active' : ''}>move</div>
      <div onClick={() => this.setState({tool: 'remove'})}
           styleName={this.state.tool === 'remove' ? 'active' : ''}>remove</div>
      <div onClick={() => this.setState({tool: 'scroll'})}
           styleName={this.state.tool === 'scroll' ? 'active': ''}>scroll</div>
      </div>
      <svg viewBox={[0, 0, width, height].join(' ')} width={width} height={height}
           onMouseDown={this.onMouseDown.bind(this)}
           onTouchStart={touchEventWrap(this.onMouseDown).bind(this)}
           ref={this.svg}>
      <svg viewBox={[0, -this.state.scrollY, 24, height-20].join(' ')}
           x="0" y="20"
           width={24} height={height-20}>
      {piano}
      {pianoMarks}
      </svg>
      <svg viewBox={[-this.state.scrollX, 0, width-25, 20].join(' ')}
           x="25" y="0"
           width={width-25} height={20}>
      {tickMarks}
      </svg>
      <svg viewBox={[-this.state.scrollX, -this.state.scrollY, width-25, height-20].join(' ')}
           x="25" y="20"
           width={width-25} height={height-20}>
      {vLines}
      {hLines}
      {notes}
      </svg>
      <rect x="0" y="0" width={width} height={height} fill="none" stroke="gray"/>
      </svg>
      {this.props.events.map(x=><div key={x.id}>{JSON.stringify(x)}</div>)}
      </div>
    );
  }
}

function getPosition(event, element) {
  const rect = (element || event.target).getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function touchEventWrap(eventListener) {
  return function(event) {
    const touch = event.changedTouches[0];
    if (touch) {
      event.clientX = Math.round(touch.clientX);
      event.clientY = Math.round(touch.clientY);
      return eventListener.call(this, event);
    }
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}