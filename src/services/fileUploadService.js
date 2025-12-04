import { decryptJSON } from './encryption.js';
import { getSecretsMap } from './githubApi.js';

// Upload file to Google Drive
async function uploadToGoogleDrive(file, credentials, folderUrl) {
    const folderId = extractGoogleDriveFolderId(folderUrl);

    // Exchange the stored refresh token for a short-lived access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('refresh_token', credentials.refresh_token);
    tokenParams.append('grant_type', 'refresh_token');
    if (credentials.client_id) tokenParams.append('client_id', credentials.client_id);
    if (credentials.client_secret) tokenParams.append('client_secret', credentials.client_secret);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams
    });

    const tokenJson = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) {
        console.error('Token refresh failed:', tokenJson);

        if (tokenJson?.error === 'invalid_grant') {
            throw new Error(
                'Google rejected the stored refresh token. This usually means it was revoked or does not match the configured OAuth client. Please re-authorize your Google Drive credentials in Settings.'
            );
        }

        throw new Error(`Failed to refresh access token: ${JSON.stringify(tokenJson)}`);
    }

    const { access_token } = tokenJson;

    // Create file metadata
    const metadata = {
        name: file.name,
        parents: [folderId]
    };

    // Create form data
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    // Upload file
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        body: formData
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to Google Drive');
    }

    const result = await uploadResponse.json();

    // Make the file publicly accessible
    const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
        })
    });

    if (!shareResponse.ok) {
        console.warn('Failed to make file public, it will still be accessible to the uploader');
    }

    return {
        url: result.webViewLink,
        fileId: result.id,
        fileName: result.name
    };
}

// Upload file to S3
async function uploadToS3(file, credentials, bucketUrl) {
    // Parse bucket and prefix from URL
    const { bucket, prefix } = parseS3Url(bucketUrl);

    // Generate unique file path
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${prefix}/${timestamp}_${safeName}`;

    // For S3, we'll need to use AWS SDK or signed URLs
    // This is a simplified version - in production you'd want proper S3 SDK
    const formData = new FormData();
    formData.append('key', key);
    formData.append('file', file);

    // This would need proper AWS signature
    const response = await fetch(`https://${bucket}.s3.amazonaws.com/`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload file to S3');
    }

    return {
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
        fileName: file.name
    };
}

// Upload file to GitFS (GitHub Repository)
async function uploadToGitFS(file, repo, token, folderPath = 'recordings') {
    // 1. Check File Size Limit (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large for GitFS. Limit is 50MB, your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
    }

    // 2. Check Repo Size Limit (1GB)
    const MAX_REPO_SIZE_KB = 1000 * 1024; // 1GB in KB
    const repoDetails = await fetch(`https://api.github.com/repos/${repo.full_name}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    }).then(res => res.json());

    if (repoDetails.size > MAX_REPO_SIZE_KB) {
        throw new Error(`Repository is too large (${(repoDetails.size / 1024).toFixed(2)}MB). Limit is 1GB. Please use S3 or Google Drive.`);
    }

    // 3. Upload File
    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    const content = btoa(binary);

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Ensure folderPath doesn't start with /
    const cleanPath = folderPath.replace(/^\//, '');
    const path = `${cleanPath}/${timestamp}_${safeName}`;

    const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Upload recording: ${file.name}`,
            content: content
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Failed to upload to GitFS: ${err.message}`);
    }

    const data = await response.json();
    return {
        url: data.content.html_url, // Link to file in GitHub UI
        fileName: file.name,
        fileId: data.content.sha
    };
}

// Extract Google Drive folder ID from URL
function extractGoogleDriveFolderId(url) {
    const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (!match) {
        throw new Error('Invalid Google Drive folder URL');
    }
    return match[1];
}

// Parse S3 URL to get bucket and prefix
function parseS3Url(url) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (urlObj.hostname.includes('s3')) {
        // https://bucket.s3.amazonaws.com/prefix/path
        return {
            bucket: urlObj.hostname.split('.')[0],
            prefix: pathParts.join('/')
        };
    } else {
        // https://s3.amazonaws.com/bucket/prefix/path
        return {
            bucket: pathParts[0],
            prefix: pathParts.slice(1).join('/')
        };
    }
}

// Main upload function
export async function uploadFile(file, repo, token, destinationUrl = null) {
    // Default to gitfs if no storage is configured
    const storageType = repo.config?.binary_storage_type || 'gitfs';
    const configUrl = repo.config?.storage_info?.url || 'recordings';

    // Use override URL if provided, otherwise default to config
    const targetUrl = destinationUrl || configUrl;

    // Get decrypted credentials using the CONFIG URL (where secrets are stored)
    let credentials = null;
    if (storageType !== 'gitfs') {
        const { secrets } = await getSecretsMap(token);
        const encryptedCreds = secrets[configUrl];

        if (!encryptedCreds) {
            throw new Error('No credentials found for storage URL');
        }

        credentials = await decryptJSON(token, encryptedCreds);
    }

    // Upload based on storage type using TARGET URL
    let result;
    if (storageType === 'google_drive') {
        result = await uploadToGoogleDrive(file, credentials, targetUrl);
    } else if (storageType === 's3') {
        result = await uploadToS3(file, credentials, targetUrl);
    } else if (storageType === 'gitfs') {
        // For gitfs, targetUrl is the folder path (e.g. 'recordings')
        result = await uploadToGitFS(file, repo, token, targetUrl || 'recordings');
    } else {
        throw new Error(`Unsupported storage type: ${storageType}`);
    }

    // Record file metadata in GitHub
    await recordFileUpload(token, repo, {
        fileName: result.fileName,
        fileUrl: result.url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        storageType: storageType
    });

    return result;
}

// Record file upload in GitHub repo
async function recordFileUpload(token, repo, fileMetadata) {
    const path = `.skygit/files/${Date.now()}_${fileMetadata.fileName}.json`;
    const content = btoa(JSON.stringify(fileMetadata, null, 2));

    const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Upload file: ${fileMetadata.fileName}`,
            content: content
        })
    });

    if (!response.ok) {
        console.warn('Failed to record file upload metadata');
    }
}

// Get all files for a repository
export async function getRepositoryFiles(token, repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/.skygit/files`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return [];
            }
            throw new Error('Failed to fetch files');
        }

        const files = await response.json();
        const fileMetadata = [];

        // Fetch each file's content
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                try {
                    const contentResponse = await fetch(file.download_url);
                    const metadata = await contentResponse.json();
                    fileMetadata.push(metadata);
                } catch (e) {
                    console.warn('Failed to parse file metadata:', file.name);
                }
            }
        }

        // Sort by upload date, newest first
        return fileMetadata.sort((a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
    } catch (error) {
        console.error('Failed to get repository files:', error);
        return [];
    }
}
