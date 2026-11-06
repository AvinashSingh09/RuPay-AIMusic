export interface CloudinaryUploadResult {
  secureUrl: string;
  downloadUrl: string;
  publicId: string;
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmine8ovl').trim();
  const uploadPreset = (
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
    import.meta.env.VITE_CLOUDINARY_FOLDER ||
    'RuPayData'
  ).trim();
  return Boolean(cloudName && uploadPreset);
}

/**
 * Uploads a generated audio Blob (MP3/WAV) to Cloudinary using an unsigned upload preset.
 * Returns the public `secureUrl` (and `fl_attachment` download URL) for the QR code.
 */
export async function uploadAudioToCloudinary(
  audioBlob: Blob,
  mimeType: string,
  trackLabel: string = 'rupay-aura-anthem'
): Promise<CloudinaryUploadResult> {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmine8ovl').trim();
  const uploadPreset = (
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
    import.meta.env.VITE_CLOUDINARY_FOLDER ||
    'RuPayData'
  ).trim();
  const folder = (import.meta.env.VITE_CLOUDINARY_FOLDER || 'RuPay').trim();

  if (!cloudName) {
    throw new Error(
      'Cloudinary Cloud Name is missing. Set VITE_CLOUDINARY_CLOUD_NAME in your .env file.'
    );
  }

  if (!uploadPreset) {
    throw new Error(
      'Cloudinary unsigned upload preset/folder is missing. Set VITE_CLOUDINARY_UPLOAD_PRESET (and VITE_CLOUDINARY_FOLDER) in your .env file.'
    );
  }

  const ext = mimeType.includes('wav') ? 'wav' : 'mp3';
  const safeSlug = trackLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const fileName = `${safeSlug || 'rupay-anthem'}-${Date.now()}.${ext}`;

  const file = new File([audioBlob], fileName, { type: mimeType || 'audio/mpeg' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(`Cloudinary upload failed: ${errorDetail}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  const secureUrl = data.secure_url;
  const downloadUrl = secureUrl.includes('/upload/')
    ? secureUrl.replace('/upload/', '/upload/fl_attachment/')
    : secureUrl;

  return {
    secureUrl,
    downloadUrl,
    publicId: data.public_id,
  };
}
