import { test, expect } from '@playwright/test';
import {
  closeConversationShareTypeModal,
  createConversationShareTypeState,
  openConversationShareTypeModal,
  selectConversationShareType
} from '../../../src/services/conversationShareTypeStateService.js';

test('conversation share type state opens and closes the selection modal', () => {
  const initial = createConversationShareTypeState();
  const opened = openConversationShareTypeModal(initial);
  const closed = closeConversationShareTypeModal(opened);

  expect(initial).toEqual({ type: 'screen', showModal: false });
  expect(opened).toEqual({ type: 'screen', showModal: true });
  expect(closed).toEqual({ type: 'screen', showModal: false });
});

test('conversation share type state selects a share type and hides the modal', () => {
  const selected = selectConversationShareType(
    { type: 'screen', showModal: true },
    'window'
  );

  expect(selected).toEqual({ type: 'window', showModal: false });
});
