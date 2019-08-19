import React from 'react';
import { getPosition, touchEventWrap, clamp } from '../util';

export default class HScrollBar extends React.Component {
  constructor(props) {
    super(props);
    this.bar = React.createRef();
  }

  onMouseDownOnBar(e) {
    const {x} = getPosition(e, this.bar.current);
    const {width, height, scrollMin, scrollMax, scrollLeft, scrollRight} = this.props;
    const ratio = (x - height) / (width - height - 2);
    const center = ratio * (scrollMax - scrollMin) - scrollMin;
    const left = clamp(
      center - (scrollRight - scrollLeft) / 2,
      scrollMin,
      scrollMax - (scrollRight - scrollLeft));
    this.props.onSet(left);
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
              fill="#c8c8c8"/>
      </g>
    );
  }
}
