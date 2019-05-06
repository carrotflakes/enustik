import React from 'react';
import './PianoRoll.css';
import { resolution } from '../consts';

export default class PianoRoll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      widthScale: 24,
      heightScale: 6,
      scrollX: 0,
      scrollY: 0,
      mode: null,
      event: null,
      tool: 'note',
      durationUnit: {n: 1, d: 4}
    };
    this.svg = React.createRef();
  }

  componentDidMount() {
    console.log('mount');
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  componentWillUnmount() {
    console.log('unmount');
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
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
        break;
      }
      case 'scroll': {
        this.setState({
          mode: 'scrolling',
          scroll: {x, y}
        });
        break;
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
        break;
      }
      case 'scrolling': {
        const {x, y} = getPosition(e, this.svg.current);
        const {scrollX, scrollY, scroll} = this.state;
        const newScrollX = Math.min(0, scrollX + x - scroll.x);
        const newScrollY = Math.min(0, scrollY + y - scroll.y);
        this.setState({
          scrollX: newScrollX,
          scrollY: newScrollY,
          scroll: {x: scroll.x + newScrollX - scrollX, y: scroll.y + newScrollY - scrollY}
        });
        break;
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
        break;
      }
      case 'scrolling': {
        this.setState({
          mode: null,
          scroll: null
        });
        break;
      }
    }
  }

  notePosition({x, y}) {
    x -= this.state.scrollX;
    y -= this.state.scrollY;
    const {durationUnit: {n, d}} = this.state;
    return {
      notenum: 99 - (y / this.state.heightScale | 0),
      tick: ((x - 25) * d / n / this.state.widthScale | 0) * n / d * resolution
    };
  }

  render() {
    const note = event => {
      return <rect x={event.start * this.state.widthScale / resolution + 1}
                     y={(99 - event.notenum) * this.state.heightScale + 1}
                     width={event.duration * this.state.widthScale / resolution - 1}
                     height={this.state.heightScale - 1}
                     key={event.id}/>;
    }
    const notes = this.props.events.map(note);
    this.state.event && notes.push(note(this.state.event));
    const {width, height} = this.props;
    const piano = Array(100).fill(0).map(
      (x, i) => <rect x="0" y={this.state.heightScale * i + this.state.scrollY}
                      width="24"
                      height={this.state.heightScale - 1}
                      fill={['#DDD', '#777']["010100101010"[i%12]]}
                      key={i}/>);

    const hLines = Array(100).fill(0).map(
      (x, i) => <line x1={0} y1={i * this.state.heightScale}
                      x2={10000} y2={i * this.state.heightScale}
                      stroke={i % 12 ? '#DDD' : '#AAA'}
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
           style={{color: this.state.tool === 'note' ? 'orange' : 'gray'}}>note</div>
      <div onClick={() => this.setState({tool: 'scroll'})}
           style={{color: this.state.tool === 'scroll' ? 'orange' : 'gray'}}>scroll</div>
      </div>
      <svg viewBox={[0, 0, width, height].join(' ')} width={width} height={height}
           onMouseDown={this.onMouseDown.bind(this)}
           ref={this.svg}>
      {piano}
      <svg viewBox={[-this.state.scrollX, -this.state.scrollY, width-25, height].join(' ')}
      x="25" y="0"
      width={width-25} height={height}>
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
