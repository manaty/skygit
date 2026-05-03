import { test, expect } from '@playwright/test';
import {
  createUploadDestinationChoiceState,
  requestUploadDestinationChoice,
  resetUploadDestinationChoice,
  selectUploadDestinationChoice
} from '../../../src/services/uploadDestinationChoiceStateService.js';

test('upload destination choice state opens the modal and resolves selections', async () => {
  let state = createUploadDestinationChoiceState();
  const promise = requestUploadDestinationChoice({
    state,
    setState: next => {
      state = next;
    }
  });

  expect(state.destination).toBeNull();
  expect(state.showModal).toBe(true);
  expect(typeof state.resolveChoice).toBe('function');

  state = selectUploadDestinationChoice(state, 's3');

  await expect(promise).resolves.toBe('s3');
  expect(state).toEqual({
    destination: 's3',
    showModal: false,
    resolveChoice: null
  });
});

test('upload destination choice state resolves previous and cancelled choices to null', async () => {
  let state = createUploadDestinationChoiceState();
  const firstPromise = requestUploadDestinationChoice({
    state,
    setState: next => {
      state = next;
    }
  });
  const secondPromise = requestUploadDestinationChoice({
    state,
    setState: next => {
      state = next;
    }
  });

  await expect(firstPromise).resolves.toBeNull();

  state = resetUploadDestinationChoice(state);

  await expect(secondPromise).resolves.toBeNull();
  expect(state).toEqual(createUploadDestinationChoiceState());
});
