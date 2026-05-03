export function createUploadDestinationChoiceState() {
  return {
    destination: null,
    showModal: false,
    resolveChoice: null
  };
}

export function requestUploadDestinationChoice({
  state,
  setState
}) {
  if (state.resolveChoice) {
    state.resolveChoice(null);
  }

  return new Promise(resolve => {
    setState({
      destination: null,
      showModal: true,
      resolveChoice: resolve
    });
  });
}

export function selectUploadDestinationChoice(state, destination) {
  if (state.resolveChoice) {
    state.resolveChoice(destination);
  }

  return {
    destination,
    showModal: false,
    resolveChoice: null
  };
}

export function resetUploadDestinationChoice(state) {
  if (state.resolveChoice) {
    state.resolveChoice(null);
  }

  return createUploadDestinationChoiceState();
}
