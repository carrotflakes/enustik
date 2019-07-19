import React from 'react';
import './PianoRoll.css';
import Selector from './Selector';
import { resolution } from '../consts';

export default class PianoRoll extends React.Component {
  constructor(props) {
    super(props);
    const heightScale = 6 * 3;
    this.state = {
      width: 600,
      height: 400,
      widthScale: 24 * 3,
      heightScale,
      scrollX: 0,
      scrollY: -heightScale * 12 * 4 + props.height / 2,
      mode: null,
      event: null,
      movingEvents: null,
      tool: 'note',
      durationUnit: {n: 1, d: 4},
      currentChannel: 0,
      rectangle: null,
      selectedNotes: [],
      cursor: 'pointer',
    };
    this.root = React.createRef();
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
      resize: e => {
        this.setState({
          width: this.root.current.clientWidth,
          height: this.root.current.clientHeight
        })
      }
    };
    for (let key in this.eventListeners) {
      window.addEventListener(key, this.eventListeners[key], {passive: false});
    }

    this.eventListeners.resize();
  }

  componentWillUnmount() {
    console.log('unmount');
    for (let key in this.eventListeners) {
      window.removeEventListener(key, this.eventListeners[key]);
    }
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
            channel: this.state.currentChannel,
            notenum,
            start: tick,
            duration: resolution * n / d
          },
          mouseMove: e => {
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
          },
          mouseUp: e => {
            this.props.addNote(this.state.event);
            this.setState({
              mode: null,
              event: null,
              mouseMove: null,
              mouseUp: null
            });
            return false;
          }
        });
        return false;
      }
      case 'move': {
        const {baseX, notenum, rawTick} = this.notePosition({x, y});
        const event = this.props.events.find(
          event => event.notenum === notenum &&
                 event.start <= rawTick &&
                 rawTick <= event.start + event.duration);
        if (event) {
          const movingEvents = this.state.selectedNotes.find(n => n.id === event.id) ?
                this.state.selectedNotes : [{...event}];
          this.setState({
            mode: 'moving',
            movingEvents,
            moveOffsetX: baseX - event.start / resolution * this.state.widthScale,
            moveOffsetY: 0,
            mouseMove: e => {
              const {x, y} = getPosition(e, this.svg.current);
              const {notenum, tick} = this.notePosition({
                x: x - this.state.moveOffsetX,
                y: y - this.state.moveOffsetY
              });
              const graspedEvent = this.state.movingEvents.find(e => e.id === event.id);
              const dNotenum = notenum - graspedEvent.notenum;
              const dTick = tick - graspedEvent.start;
              this.setState({
                movingEvents: this.state.movingEvents.map(e => ({
                  ...e,
                  notenum: clamp(e.notenum + dNotenum, 0, 127),
                  start: clamp(e.start + dTick, 0, 10000000 * resolution)
                }))
              });
              e.preventDefault();
              return false;
            },
            mouseUp: e => {
              for (const e of this.state.movingEvents)
                this.props.moveNote(e);
              this.setState({
                mode: null,
                movingEvents: null,
                mouseMove: null,
                mouseUp: null
              });
              return false;
            }
          });
        }
        return false;
      }
      case 'remove': {
        const {notenum, rawTick} = this.notePosition({x, y});
        const event = this.props.events.find(
          event => event.notenum === notenum &&
                 event.start <= rawTick &&
                 rawTick <= event.start + event.duration);
        if (event) {
          this.props.removeEvent(event.id);
        }
        return false;
      }
      case 'scroll': {
        this.setState({
          mode: 'scrolling',
          scroll: {x, y},
          mouseMove: e => {
            const {x, y} = getPosition(e, this.svg.current);
            const {scrollX, scrollY, scroll} = this.state;
            const newScrollX = -clamp(-(scrollX + x - scroll.x), 0,
                                      this.state.widthScale * 100 - (this.state.width-25));
            const newScrollY = -clamp(-(scrollY + y - scroll.y), 0,
                                      this.state.heightScale * 128 - (this.state.height-20));
            this.setState({
              scrollX: newScrollX,
              scrollY: newScrollY,
              scroll: {x: scroll.x + newScrollX - scrollX, y: scroll.y + newScrollY - scrollY}
            });
            e.preventDefault();
            return false;
          },
          mouseUp: e => {
            this.setState({
              mode: null,
              scroll: null,
              mouseMove: null,
              mouseUp: null
            });
            return false;
          }
        });
        return false;
      }
      case 'select': {
        this.setState({
          mode: 'selecting',
          rectangle: {
            start: this.notePosition({x, y}),
            end: this.notePosition({x, y}),
            top() {return Math.min(this.start.baseY, this.end.baseY);},
            left() {return Math.min(this.start.baseX, this.end.baseX);},
            width() {return Math.abs(this.start.baseX - this.end.baseX);},
            height() {return Math.abs(this.start.baseY - this.end.baseY);},
          },
          selectedNotes: [],
          mouseMove: e => {
            const rectangle = {
                ...this.state.rectangle,
              end: this.notePosition(getPosition(e, this.svg.current))
            };
            const minNotenum = Math.min(rectangle.start.notenum, rectangle.end.notenum);
            const maxNotenum = Math.max(rectangle.start.notenum, rectangle.end.notenum);
            const start = Math.min(rectangle.start.rawTick, rectangle.end.rawTick);
            const end = Math.max(rectangle.start.rawTick, rectangle.end.rawTick);
            this.setState({
              rectangle,
              selectedNotes: this.props.events.filter(event => {
                return start <= event.start + event.duration && event.start <= end &&
                  minNotenum <= event.notenum && event.notenum <= maxNotenum;
              })
            });
            e.preventDefault();
            return false;
          },
          mouseUp: e => {
            this.setState({
              mode: null,
              rectangle: null,
              mouseMove: null,
              mouseUp: null
            });
            return false;
          }
        });
        return false;
      }
    }
  }

  onMouseMove(e) {
    if (this.state.mouseMove)
      return this.state.mouseMove(e);

    const {notenum, rawTick} = this.notePosition(getPosition(e, this.svg.current));
    const event = this.props.events.find(
      event => event.notenum === notenum &&
        event.start <= rawTick &&
        rawTick <= event.start + event.duration);
    this.setState({cursor: event ? 'pointer' : 'default'});
  }

  onMouseUp(e) {
    if (this.state.mouseUp)
      return this.state.mouseUp(e);
  }

  notePosition({x, y}) {
    x -= this.state.scrollX + 25;
    y -= this.state.scrollY + 20;
    const {durationUnit: {n, d}} = this.state;
    return {
      baseX: x,
      baseY: y,
      notenum: 127 - (y / this.state.heightScale | 0),
      tick: (x * d / n / this.state.widthScale | 0) * n / d * resolution,
      rawTick: x * resolution / this.state.widthScale | 0
    };
  }

  render() {
    const selected = event => this.state.selectedNotes.find(n => n.id === event.id);
    const note = event => {
      const hue = event.channel * 360 / 16;
      return <rect x={event.start * this.state.widthScale / resolution}
                   y={(127 - event.notenum) * this.state.heightScale}
                   width={event.duration * this.state.widthScale / resolution - 1}
                   height={this.state.heightScale - 1}
                   key={event.id}
                   fill={`hsl(${hue}, 80%, 70%)`}
                   stroke={selected(event) ? `#222`: `hsl(${hue}, 60%, 60%)`}/>;
    }
    const notes = this.props.events.map(event =>
      note((this.state.movingEvents || []).find(me => me.id === event.id) || event));
    this.state.event && notes.push(note(this.state.event));
    const {width, height} = this.state;
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

    const durationUnits = [
      {text: '1/16 beat', value: {n: 1, d: 16}},
      {text: '1/8 beat', value: {n: 1, d: 8}},
      {text: '1/4 beat', value: {n: 1, d: 4}, current: true},
      {text: '1/2 beat', value: {n: 1, d: 2}},
      {text: '1/1 beat', value: {n: 1, d: 1}},
    ];

    return (
      <div ref={this.root}>
        <div styleName="tools">
          {
            'note move remove scroll select'.split(' ').map(x => (
              <div onClick={() => this.setState({tool: x})} key={`tool/${x}`}
                   styleName={this.state.tool === x ? 'active' : ''}>{x}</div>))
          }
          <Selector items={Array(16).fill(0).map((x, i) => ({text: `ch ${i}`, value: i}))}
                    onSelect={item => this.setState({currentChannel: item.value})}/>
          <Selector items={durationUnits}
                    onSelect={item => this.setState({durationUnit: item.value})}/>
        </div>
        <svg viewBox={[0, 0, width, height].join(' ')} width={width} height={height}
             onMouseDown={this.onMouseDown.bind(this)}
             onTouchStart={touchEventWrap(this.onMouseDown).bind(this)}
             style={{'cursor': this.state.cursor}}
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
            {
              this.state.rectangle &&
                <rect x={this.state.rectangle.left()} y={this.state.rectangle.top()}
                      width={this.state.rectangle.width()} height={this.state.rectangle.height()}
                      fill="none" stroke="orange"/>
            }
          </svg>
          <rect x="0" y="0" width={width} height={height} fill="none" stroke="gray"/>
        </svg>
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
