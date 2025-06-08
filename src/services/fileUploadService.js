import { decryptJSON } from './encryption.js';
import { getSecretsMap } from './githubApi.js';

// Upload file to Google Drive
async function uploadToGoogleDrive(file, credentials, folderUrl) {
    const folderId = extractGoogleDriveFolderId(folderUrl);
    
    // For refresh tokens from OAuth Playground, we need to handle them differently
    // OAuth Playground refresh tokens only work with specific client credentials
    // that are internal to Google and change over time
    
    // First, try with the provided credentials (if any)
    let tokenParams = {
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token'
    };
    
    // Only add client credentials if they exist
    if (credentials.client_id && credentials.client_secret) {
        tokenParams.client_id = credentials.client_id;
        tokenParams.client_secret = credentials.client_secret;
    }
    
    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(tokenParams)
    });
    
    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token refresh failed:', errorData);
        
        // If it fails and we didn't have client credentials, it might be an OAuth Playground token
        // OAuth Playground tokens need special handling - they can't be refreshed programmatically
        if (!credentials.client_id || !credentials.client_secret) {
            throw new Error('OAuth Playground refresh tokens cannot be used for file uploads. Please set up Google Drive with your own OAuth credentials or use a service account.');
        }
        
        throw new Error(`Failed to refresh access token: ${errorData}`);
    }
    
    const { access_token } = await tokenResponse.json();
    
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
export async function uploadFile(file, repo, token) {
    if (!repo.config?.binary_storage_type || !repo.config?.storage_info?.url) {
        throw new Error('No storage configured for this repository');
    }
    
    const storageType = repo.config.binary_storage_type;
    const storageUrl = repo.config.storage_info.url;
    
    // Get decrypted credentials
    const { secrets } = await getSecretsMap(token);
    const encryptedCreds = secrets[storageUrl];
    
    if (!encryptedCreds) {
        throw new Error('No credentials found for storage URL');
    }
    
    const credentials = await decryptJSON(token, encryptedCreds);
    
    // Upload based on storage type
    let result;
    if (storageType === 'google_drive') {
        result = await uploadToGoogleDrive(file, credentials, storageUrl);
    } else if (storageType === 's3') {
        result = await uploadToS3(file, credentials, storageUrl);
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