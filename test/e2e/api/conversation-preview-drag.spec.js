import { test, expect } from '@playwright/test';
import {
  createPreviewDragState,
  movePreviewDrag,
  setPreviewVisibility,
  startPreviewDrag,
  stopPreviewDrag
} from '../../../src/utils/conversationPreviewDrag.js';

test('conversation preview drag helpers move from the initial pointer offset', () => {
  const initial = createPreviewDragState({ x: 20, y: 40 });
  const dragging = startPreviewDrag(initial, { clientX: 35, clientY: 70 });
  const moved = movePreviewDrag(dragging, { clientX: 50, clientY: 90 });
  const stopped = stopPreviewDrag(moved);

  expect(dragging).toMatchObject({
    dragging: true,
    offset: { x: 15, y: 30 }
  });
  expect(moved.position).toEqual({ x: 35, y: 60 });
  expect(stopped.dragging).toBe(false);
});

test('conversation preview drag helpers preserve position when idle and toggle visibility', () => {
  const initial = createPreviewDragState({ x: 12, y: 18 });
  const moved = movePreviewDrag(initial, { clientX: 200, clientY: 240 });
  const hidden = setPreviewVisibility(moved, false);
  const visible = setPreviewVisibility(hidden, true);

  expect(moved).toEqual(initial);
  expect(hidden.visible).toBe(false);
  expect(visible.visible).toBe(true);
});
