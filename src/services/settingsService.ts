// ═══════════════════════════════════════════════════════════════
// ⚙️ SETTINGS SERVICE - Integration Layer with Google CDN
// ═══════════════════════════════════════════════════════════════

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// CDN Settings Interface
export interface CDNSettings {
  provider: 'cloudflare' | 'google' | 'bunny' | 'firebase'; // ✅ ADDED: google & firebase
  enabled: boolean;
  cdnUrl: string;
  apiKey: string;
  zoneId: string;
  pullZone: string;
  caching: boolean;
  cacheTTL: number;
  // ✅ ADDED: Google Cloud specific settings
  gcsBucket?: string;
  gcsProjectId?: string;
  useFirebaseCDN?: boolean; // Use Firebase Storage's built-in CDN
}

// Encoding Settings Interface
export interface EncodingSettings {
  codec: string;
  container: string;
  resolutions: string[];
  maxBitrate: number;
  audioBitrate: number;
  audioCodec: string;
  autoEncoding: boolean;
  adaptiveBitrate: boolean;
  generateThumbnails: boolean;
  thumbnailCount: number;
  segmentDuration: number;
}

// ✅ UPDATED: Default Settings with Google CDN
const DEFAULT_CDN_SETTINGS: CDNSettings = {
  provider: 'google',
  enabled: true, // ✅ Enabled by default for Google/Firebase
  cdnUrl: '',
  apiKey: '',
  zoneId: '',
  pullZone: '',
  caching: true,
  cacheTTL: 3600,
  gcsBucket: process.env.REACT_APP_GCS_BUCKET_NAME || '',
  gcsProjectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  useFirebaseCDN: process.env.REACT_APP_USE_FIREBASE_CDN === 'true',
};

const DEFAULT_ENCODING_SETTINGS: EncodingSettings = {
  codec: 'h264',
  container: 'mp4',
  resolutions: ['360p', '480p', '720p', '1080p'],
  maxBitrate: 8000,
  audioBitrate: 192,
  audioCodec: 'aac',
  autoEncoding: true,
  adaptiveBitrate: true,
  generateThumbnails: true,
  thumbnailCount: 10,
  segmentDuration: 6,
};

// ✅ GET CDN SETTINGS
export const getCDNSettings = async (): Promise<CDNSettings> => {
  try {
    const cdnDoc = await getDoc(doc(db, 'settings', 'cdn'));
    
    if (cdnDoc.exists()) {
      const data = cdnDoc.data() as Partial<CDNSettings>;
      return {
        ...DEFAULT_CDN_SETTINGS,
        ...data,
      };
    }
    
    // Return defaults with Google CDN enabled
    return DEFAULT_CDN_SETTINGS;
  } catch (error) {
    console.error('Error fetching CDN settings:', error);
    return DEFAULT_CDN_SETTINGS;
  }
};

// ✅ GET ENCODING SETTINGS
export const getEncodingSettings = async (): Promise<EncodingSettings> => {
  try {
    const encodingDoc = await getDoc(doc(db, 'settings', 'encoding'));
    
    if (encodingDoc.exists()) {
      return {
        ...DEFAULT_ENCODING_SETTINGS,
        ...encodingDoc.data() as EncodingSettings,
      };
    }
    
    return DEFAULT_ENCODING_SETTINGS;
  } catch (error) {
    console.error('Error fetching encoding settings:', error);
    return DEFAULT_ENCODING_SETTINGS;
  }
};

// ✅ BUILD CDN URL (Updated with Google CDN support)
export const buildCDNUrl = (originalUrl: string, cdnSettings: CDNSettings): string => {
  if (!cdnSettings.enabled) {
    return originalUrl;
  }

  try {
    // ✅ Google Cloud / Firebase CDN
    if (cdnSettings.provider === 'google' || cdnSettings.provider === 'firebase') {
      // Firebase Storage already uses Google's CDN
      // Format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media
      
      if (cdnSettings.useFirebaseCDN) {
        // Firebase Storage URL is already CDN-optimized
        return originalUrl;
      }
      
      // Custom Google Cloud CDN domain
      if (cdnSettings.cdnUrl) {
        const url = new URL(originalUrl);
        const cdnBase = new URL(cdnSettings.cdnUrl);
        return originalUrl.replace(url.origin, cdnBase.origin);
      }
      
      // Use Google Cloud Storage public URL format
      if (cdnSettings.gcsBucket && originalUrl.includes('firebasestorage.googleapis.com')) {
        // Extract file path from Firebase Storage URL
        const matches = originalUrl.match(/o\/(.+?)\?/);
        if (matches && matches[1]) {
          const filePath = decodeURIComponent(matches[1]);
          return `https://storage.googleapis.com/${cdnSettings.gcsBucket}/${filePath}`;
        }
      }
      
      return originalUrl;
    }

    // ✅ Cloudflare CDN
    if (cdnSettings.provider === 'cloudflare') {
      if (!cdnSettings.cdnUrl) {
        return originalUrl;
      }
      
      const url = new URL(originalUrl);
      const cdnBase = new URL(cdnSettings.cdnUrl);
      return originalUrl.replace(url.origin, cdnBase.origin);
    }

    // ✅ Bunny CDN
    if (cdnSettings.provider === 'bunny') {
      if (!cdnSettings.pullZone) {
        return originalUrl;
      }
      
      const url = new URL(originalUrl);
      const path = url.pathname;
      return `https://${cdnSettings.pullZone}.b-cdn.net${path}`;
    }
    
    return originalUrl;
  } catch (error) {
    console.error('Error building CDN URL:', error);
    return originalUrl;
  }
};

// ✅ NEW: Generate Google Cloud CDN URL directly from path
export const generateGoogleCDNUrl = (filePath: string, cdnSettings: CDNSettings): string => {
  try {
    // Option 1: Use custom CDN domain
    if (cdnSettings.cdnUrl) {
      return `${cdnSettings.cdnUrl}/${filePath}`;
    }
    
    // Option 2: Use Firebase Storage CDN URL
    if (cdnSettings.useFirebaseCDN && cdnSettings.gcsBucket) {
      const encodedPath = encodeURIComponent(filePath);
      return `https://firebasestorage.googleapis.com/v0/b/${cdnSettings.gcsBucket}/o/${encodedPath}?alt=media`;
    }
    
    // Option 3: Use Google Cloud Storage public URL
    if (cdnSettings.gcsBucket) {
      return `https://storage.googleapis.com/${cdnSettings.gcsBucket}/${filePath}`;
    }
    
    return '';
  } catch (error) {
    console.error('Error generating Google CDN URL:', error);
    return '';
  }
};

// ✅ NEW: Check if URL is already a CDN URL
export const isCDNUrl = (url: string): boolean => {
  const cdnDomains = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'cdn.cloudflare.com',
    'b-cdn.net',
  ];
  
  return cdnDomains.some(domain => url.includes(domain));
};

// ✅ GET ENCODING QUALITY SETTINGS
export const getQualitySettings = (resolution: string, encodingSettings: EncodingSettings) => {
  const bitrateMap: Record<string, number> = {
    '360p': 800,
    '480p': 1500,
    '720p': 3000,
    '1080p': 6000,
    '1440p': 10000,
    '2160p': 15000,
  };

  const resolutionMap: Record<string, { width: number; height: number }> = {
    '360p': { width: 640, height: 360 },
    '480p': { width: 854, height: 480 },
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '1440p': { width: 2560, height: 1440 },
    '2160p': { width: 3840, height: 2160 },
  };

  return {
    resolution: resolutionMap[resolution] || resolutionMap['720p'],
    videoBitrate: Math.min(bitrateMap[resolution] || 3000, encodingSettings.maxBitrate),
    audioBitrate: encodingSettings.audioBitrate,
    codec: encodingSettings.codec,
    audioCodec: encodingSettings.audioCodec,
    container: encodingSettings.container,
  };
};
