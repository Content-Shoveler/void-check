/**
 * Calendar Integration Types
 */

// Source identifiers for tasks
export type TaskSource = 'internal' | 'google' | 'microsoft';

// Status types that map across different systems
export interface TaskStatus {
  completed: boolean;
  completedAt?: Date;
  // Calendar-specific status fields
  calendarStatus?: 'confirmed' | 'tentative' | 'cancelled';
}

// Normalized calendar event attendee 
export interface Attendee {
  email: string;
  name?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  // Optional fields that might only be in certain providers
  optional?: boolean;
  organizer?: boolean;
}

// Unified recurrence pattern that works across providers
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
  
  // Calendar-specific recurrence data
  rawPattern?: string; // For storing iCalendar RRULE or other formats
}

// Reminders that can work across systems
export interface Reminder {
  type: 'notification' | 'email' | 'popup';
  minutes: number;
  // Provider-specific fields
  method?: string;
  enabled: boolean;
}

// Normalized calendar model
export interface NormalizedCalendar {
  id: string;
  providerId: string;  // Identifies which provider this calendar belongs to
  name: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  isReadOnly: boolean;
}

// Normalized event model used across providers
export interface NormalizedEvent {
  id: string;
  calendarId: string;
  providerId: string;
  title: string;
  description?: string;
  location?: string;
  start: {
    dateTime: Date;
    timeZone?: string;
  };
  end: {
    dateTime: Date;
    timeZone?: string;
  };
  isAllDay: boolean;
  recurrence?: RecurrencePattern[];
  attendees?: Attendee[];
  reminders?: Reminder[];
  externalId?: string;  // The original ID from the provider
  sourceUrl?: string;   // Link to the event in the provider's UI
  lastModified: Date;
  lastSynced: Date;
  metadata?: Record<string, any>; // Provider-specific data we want to preserve
}

// Integration provider configuration
export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  authConfig?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    scope?: string;
  };
  settings: {
    syncDirection: 'push' | 'pull' | 'bidirectional';
    defaultCalendarId?: string;
    syncFrequency?: number; // minutes
    createReminders?: boolean;
  };
}

// Token information for OAuth providers
export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp
  scope: string;
}

// Webhook payload type for real-time updates
export interface WebhookPayload {
  providerId: string;
  calendarId?: string;
  eventId?: string;
  resourceUri?: string;
  changeType?: 'created' | 'updated' | 'deleted';
  subscriptionId: string;
  expirationTime?: Date;
}

// Task-Event mapping for tracking sync state
export interface TaskEventMapping {
  taskId: string;
  providerId: string;
  eventId: string;
  lastSynced: Date;
}
