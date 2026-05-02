export function getRecordingUploadCredentials(decryptedSecrets = {}, repoConfig = null) {
  const credentials = {
    s3: null,
    google_drive: null
  };

  const repoCredentialUrl = repoConfig?.storage_info?.url;
  const repoCredential = repoCredentialUrl ? decryptedSecrets[repoCredentialUrl] : null;

  if (repoCredential?.type === 's3') {
    credentials.s3 = repoCredential;
  }

  if (repoCredential?.type === 'google_drive') {
    credentials.google_drive = repoCredential;
  }

  for (const secret of Object.values(decryptedSecrets)) {
    if (secret?.type === 's3' && !credentials.s3) {
      credentials.s3 = secret;
    }

    if (secret?.type === 'google_drive' && !credentials.google_drive) {
      credentials.google_drive = secret;
    }
  }

  const availableDestinations = Object.entries(credentials)
    .filter(([, credential]) => Boolean(credential))
    .map(([destination]) => destination);

  return {
    availableDestinations,
    credentials
  };
}
