import { formatDistanceToNow } from 'date-fns';

/**
 * Format a date string to relative time (e.g., "5 min ago", "2 hours ago", "3 days ago")
 */
export function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}
