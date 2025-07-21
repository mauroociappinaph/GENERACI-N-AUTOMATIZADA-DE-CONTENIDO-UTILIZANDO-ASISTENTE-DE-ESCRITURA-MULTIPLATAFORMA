/**
 * Helper functions for date formatting and manipulation
 * SRP: Date formatting utilities
 */
/**
 * Parse date string to Date object with validation
 */
export declare function parseDate(dateString: string): Date;
/**
 * Format date for database queries
 */
export declare function formatDateForQuery(date: Date): string;
/**
 * Create date range object for queries
 */
export declare function createDateRange(from?: string, to?: string): {
    gte?: Date;
    lte?: Date;
} | null;
/**
 * Get date N days ago
 */
export declare function getDaysAgo(days: number): Date;
/**
 * Format date for display
 */
export declare function formatDateForDisplay(date: Date): string;
/**
 * Check if date is within range
 */
export declare function isDateInRange(date: Date, from?: Date, to?: Date): boolean;
/**
 * Get start of day
 */
export declare function getStartOfDay(date: Date): Date;
/**
 * Get end of day
 */
export declare function getEndOfDay(date: Date): Date;
