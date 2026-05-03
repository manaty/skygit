export function createPreviewDragState(position = { x: 0, y: 0 }) {
  return {
    position: { ...position },
    dragging: false,
    offset: { x: 0, y: 0 },
    visible: true
  };
}

export function startPreviewDrag(state, event) {
  return {
    ...state,
    dragging: true,
    offset: {
      x: event.clientX - state.position.x,
      y: event.clientY - state.position.y
    }
  };
}

export function movePreviewDrag(state, event) {
  if (!state.dragging) {
    return state;
  }

  return {
    ...state,
    position: {
      x: event.clientX - state.offset.x,
      y: event.clientY - state.offset.y
    }
  };
}

export function stopPreviewDrag(state) {
  return {
    ...state,
    dragging: false
  };
}

export function setPreviewVisibility(state, visible) {
  return {
    ...state,
    visible
  };
}
