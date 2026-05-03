export function createConversationShareTypeState(type = 'screen') {
  return {
    type,
    showModal: false
  };
}

export function openConversationShareTypeModal(state) {
  return {
    ...state,
    showModal: true
  };
}

export function closeConversationShareTypeModal(state) {
  return {
    ...state,
    showModal: false
  };
}

export function selectConversationShareType(state, type) {
  return {
    ...state,
    type,
    showModal: false
  };
}
