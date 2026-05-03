import { getRecordingUploadCredentials } from '../utils/uploadCredentials.js';

export function createRecordingMessage(link) {
  return {
    type: 'chat',
    content: `📹 Recording: ${link}`
  };
}

export async function uploadRecordingToDestination({
  blob,
  destination,
  credentials,
  uploadToS3,
  uploadToGoogleDrive
}) {
  if (destination === 's3') {
    return uploadToS3(blob, credentials);
  }

  if (destination === 'google_drive') {
    return uploadToGoogleDrive(blob, credentials);
  }

  return null;
}

export async function uploadAndShareConversationRecording({
  blob,
  decryptedSettings,
  repoConfig,
  chooseUploadDestination,
  uploadToS3,
  uploadToGoogleDrive,
  sendMessageToPeer,
  currentCallPeer,
  alertUser = alert,
  getCredentials = getRecordingUploadCredentials,
  createMessage = createRecordingMessage
}) {
  const { credentials } = getCredentials(decryptedSettings, repoConfig);
  const destination = await chooseUploadDestination();

  if (!destination) {
    alertUser('No upload destination (S3 or Google Drive) configured.');
    return { status: 'missing_destination' };
  }

  try {
    const link = await uploadRecordingToDestination({
      blob,
      destination,
      credentials: credentials[destination],
      uploadToS3,
      uploadToGoogleDrive
    });

    if (!link) {
      return { status: 'unsupported_destination', destination };
    }

    sendMessageToPeer(currentCallPeer, createMessage(link));
    alertUser('Recording uploaded and link shared!');
    return { status: 'shared', destination, link };
  } catch (error) {
    alertUser(error.message);
    return { status: 'failed', destination, error };
  }
}
