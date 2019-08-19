import React from 'react';
import { getPosition, touchEventWrap, clamp } from '../util';
import { setListener } from '../mouseManager';

export default class HScrollBar extends React.Component {
  constructor(props) {
    super(props);
    this.bar = React.createRef();
  }

  onMouseDownOnBar(e) {
    this.mouseMove(e, 0);
    setListener(
      e => {
        this.mouseMove(e, 0);
        e.preventDefault();
        return false;
      },
      e => {
        return false;
      });
    return false;
  }

  onMouseDownOnBarCurrent(e) {
    const {scrollLeft, scrollRight} = this.props;
    const currentCenter = (scrollRight + scrollLeft) / 2;
    const centerOffset = currentCenter - this.getCenter(e);
    setListener(
      e => {
        this.mouseMove(e, centerOffset);
        e.preventDefault();
        return false;
      },
      e => {
        return false;
      });
    return false;
  }

  mouseMove(e, offset) {
    const center = this.getCenter(e) + offset;
    const {scrollMin, scrollMax, scrollLeft, scrollRight} = this.props;
    const left = clamp(
      center - (scrollRight - scrollLeft) / 2,
      scrollMin,
      scrollMax - (scrollRight - scrollLeft));
    this.props.onSet(left);
  }

  getCenter(e) {
    const {x} = getPosition(e, this.bar.current);
    const {width, height, scrollMin, scrollMax} = this.props;
    const ratio = (x - height) / (width - height - 2);
    return ratio * (scrollMax - scrollMin) - scrollMin;
  }

  render() {
    const {x, y, width, height, scrollMin, scrollMax, scrollLeft, scrollRight} = this.props;
    const left = scrollLeft / (scrollMax - scrollMin);
    const right = scrollRight / (scrollMax - scrollMin);
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="0" y="0" width={width} height={height}
              fill="#e8e8e8"
              onMouseDown={this.onMouseDownOnBar.bind(this)}
              onTouchStart={touchEventWrap(this.onMouseDownOnBar).bind(this)}
              ref={this.bar}/>
        <rect x="0" y="0" width={height} height={height}
              fill="#d0d0d0"/>
        <rect x={width - height} y="0" width={height} height={height}
              fill="#d0d0d0"/>
        <rect x={height + 1 + left * (width - height - 2)} y={1}
              width={(right - left) * (width - height - 2)} height={height - 2}
              fill="#c8c8c8"
              onMouseDown={this.onMouseDownOnBarCurrent.bind(this)}
              onTouchStart={touchEventWrap(this.onMouseDownOnBarCurrent).bind(this)}/>
      </g>
    );
  }
}
