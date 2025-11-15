// Default images for different event types
export const EVENT_TYPE_IMAGES = {
  'reunion': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=200&fit=crop',
  'networking': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop',
  'workshop': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
  'seminar': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
  'career-fair': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
  'fundraising': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop',
  'social': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop',
  'other': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=200&fit=crop'
};

/**
 * Get event image URL with fallback to default image based on event type
 * @param {Object} event - Event object
 * @returns {string} - Image URL
 */
export const getEventImage = (event) => {
  // Check for event image in various formats
  if (event?.image?.url) {
    return event.image.url;
  }
  
  if (event?.coverImage?.url) {
    return event.coverImage.url;
  }
  
  if (event?.coverImage && typeof event.coverImage === 'string' && event.coverImage.trim()) {
    return event.coverImage;
  }
  
  if (event?.imageUrl && typeof event.imageUrl === 'string' && event.imageUrl.trim()) {
    return event.imageUrl;
  }
  
  // Return default image based on event type
  return EVENT_TYPE_IMAGES[event?.eventType] || EVENT_TYPE_IMAGES['other'];
};
