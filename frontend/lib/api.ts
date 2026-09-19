const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong',
    );
  }

  return data;
}

// ==========================================
// IMAGE URL HELPER
// ==========================================

export function getImageUrl(
  image?: string | null,
) {
  if (!image) {
    return '';
  }

  // Cloudinary / external image
  if (
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image;
  }

  // Old local upload path
  return `${API_URL}${image}`;
}