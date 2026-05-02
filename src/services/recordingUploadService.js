export async function uploadRecordingToS3(blob, cred, fetchImpl = fetch) {
  const fileName = `skygit-recording-${Date.now()}.webm`;
  const bucket = cred?.bucket;
  const region = cred?.region;

  if (!bucket || !region) {
    throw new Error('S3 credential missing bucket or region.');
  }

  const endpoint = cred.endpoint || `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
  const putRes = await fetchImpl(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/webm' },
    body: blob
  });

  if (!putRes.ok) {
    throw new Error('Failed to upload to S3. Private buckets need signed URLs or a backend proxy.');
  }

  return endpoint.split('?')[0];
}

export async function getGoogleAccessToken(cred, fetchImpl = fetch) {
  const params = new URLSearchParams();
  if (cred.client_id) params.append('client_id', cred.client_id);
  if (cred.client_secret) params.append('client_secret', cred.client_secret);
  params.append('refresh_token', cred.refresh_token);
  params.append('grant_type', 'refresh_token');

  const res = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data?.error === 'invalid_grant') {
      throw new Error('Stored Google Drive refresh token is no longer valid. Please reconnect your Google Drive credential.');
    }
    throw new Error(`Failed to get Google access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

export async function uploadRecordingToGoogleDrive(blob, cred, fetchImpl = fetch) {
  const accessToken = await getGoogleAccessToken(cred, fetchImpl);
  const metadata = {
    name: `SkyGit Recording ${new Date().toISOString()}.webm`,
    mimeType: 'video/webm'
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const uploadRes = await fetchImpl('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken },
    body: form
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload to Google Drive');
  }

  const fileData = await uploadRes.json();
  await fetchImpl(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  });

  const metaRes = await fetchImpl(`https://www.googleapis.com/drive/v3/files/${fileData.id}?fields=webViewLink,webContentLink`, {
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const meta = await metaRes.json();

  return meta.webViewLink || meta.webContentLink;
}
