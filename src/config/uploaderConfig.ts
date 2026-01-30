export const IMAGE_UPLOAD_CONFIGS = {
    // Main poster images (movies, series, events)
    poster: {
        maxSize: 10,
        acceptedFormats: ['jpg', 'jpeg', 'png'],
        aspectRatio: '2:3',
    },

    // Landscape images (thumbnails, covers)
    landscape: {
        maxSize: 10,
        acceptedFormats: ['jpg', 'jpeg', 'png'],
        aspectRatio: '16:9',
    },

    // Wide banners
    banner: {
        maxSize: 15,
        acceptedFormats: ['jpg', 'jpeg', 'png'],
        aspectRatio: '3:1',
    },

    // Gallery/multiple images
    gallery: {
        maxSize: 5,
        acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    },

    // Profile/avatar images
    profile: {
        maxSize: 3,
        acceptedFormats: ['jpg', 'jpeg', 'png'],
        aspectRatio: '1:1',
    },
};

export const VIDEO_UPLOAD_CONFIGS = {
    // Full movies/episodes
    fullContent: {
        maxSize: 5000,
        acceptedFormats: ['mp4'],
    },

    // Trailers
    trailer: {
        maxSize: 200,
        acceptedFormats: ['mp4', 'webm'],
    },

    // Short promos
    promo: {
        maxSize: 100,
        acceptedFormats: ['mp4', 'webm'],
    },

    // Livestreams/recordings
    livestream: {
        maxSize: 2000,
        acceptedFormats: ['mp4'],
    },
};