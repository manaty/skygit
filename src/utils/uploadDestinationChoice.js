export function chooseRecordingUploadDestination(availableDestinations, requestChoice) {
  if (availableDestinations.length === 0) return null;
  if (availableDestinations.length === 1) return availableDestinations[0];

  return requestChoice();
}
