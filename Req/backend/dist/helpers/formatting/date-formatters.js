"use strict";
/**
 * Helper functions for date formatting and manipulation
 * SRP: Date formatting utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.formatDateForQuery = formatDateForQuery;
exports.createDateRange = createDateRange;
exports.getDaysAgo = getDaysAgo;
exports.formatDateForDisplay = formatDateForDisplay;
exports.isDateInRange = isDateInRange;
exports.getStartOfDay = getStartOfDay;
exports.getEndOfDay = getEndOfDay;
/**
 * Parse date string to Date object with validation
 */
function parseDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${dateString}`);
    }
    return date;
}
/**
 * Format date for database queries
 */
function formatDateForQuery(date) {
    return date.toISOString();
}
/**
 * Create date range object for queries
 */
function createDateRange(from, to) {
    if (!from && !to)
        return null;
    const range = {};
    if (from) {
        range.gte = parseDate(from);
    }
    if (to) {
        range.lte = parseDate(to);
    }
    return range;
}
/**
 * Get date N days ago
 */
function getDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}
/**
 * Format date for display
 */
function formatDateForDisplay(date) {
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
/**
 * Check if date is within range
 */
function isDateInRange(date, from, to) {
    if (from && date < from)
        return false;
    if (to && date > to)
        return false;
    return true;
}
/**
 * Get start of day
 */
function getStartOfDay(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}
/**
 * Get end of day
 */
function getEndOfDay(date) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
}
