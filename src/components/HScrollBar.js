import React from 'react';

export default class HScrollBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {x, y, width, height, scrollMin, scrollMax, scrollLeft, scrollRight} = this.props;
    const left = scrollLeft / (scrollMax - scrollMin);
    const right = scrollRight / (scrollMax - scrollMin);
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="0" y="0" width={width} height={height}
              fill="#e8e8e8" onMouseDown={()=>console.log(1)}/>
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
