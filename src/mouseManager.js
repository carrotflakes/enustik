import { touchEventWrap } from './util';

let mouseMoveListener = null;
let mouseUpListener = null;

export function setListener(mouseMove, mouseUp) {
  mouseMoveListener = mouseMove;
  mouseUpListener = mouseUp;
}

export function unsetListener() {
  mouseMoveListener = null;
  mouseUpListener = null;
}

function onMouseMove(e) {
  if (mouseMoveListener)
    return mouseMoveListener(e);
}

function onMouseUp(e) {
  if (mouseUpListener) {
    const returnValue = mouseUpListener(e);
    unsetListener();
    return returnValue;
  }
}

const eventListeners = {
  mouseup: onMouseUp,
  mousemove: onMouseMove,
  touchend: touchEventWrap(onMouseUp),
  touchmove: touchEventWrap(onMouseMove),
  touchcancel: touchEventWrap(onMouseUp),
};

function mount() {
  for (const key in eventListeners)
    window.addEventListener(key, eventListeners[key], {passive: false});
}

mount();
