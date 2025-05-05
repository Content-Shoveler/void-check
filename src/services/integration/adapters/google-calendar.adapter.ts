import type { Task } from '../../../types';
import type { 
  NormalizedCalendar, 
  NormalizedEvent, 
  TokenInfo,
  Reminder,
  RecurrencePattern,
  Attendee
} from '../../../types/integration';
import type { CalendarAdapter } from '../calendarService';

/**
 * Google Calendar Adapter
 * Implements the CalendarAdapter interface for Google Calendar
 */
export class GoogleCalendarAdapter implements CalendarAdapter {
  readonly id = 'google';
  readonly name = 'Google Calendar';
  readonly description = 'Connect to your Google Calendar account';
  readonly icon = 'google';

  private clientId: string;
  private apiKey: string;
  private authData: TokenInfo | null = null;
  
  constructor(config: { clientId: string; apiKey: string }) {
    this.clientId = config.clientId;
    this.apiKey = config.apiKey;
    this.loadAuthData();
  }
  
  /**
   * Check if the user is authenticated with Google
   */
  isAuthenticated(): boolean {
    if (!this.authData) return false;
    return Date.now() < this.authData.expiresAt;
  }
  
  /**
   * Start the OAuth flow to authenticate with Google
   */
  async authenticate(): Promise<boolean> {
    // This would be implemented with a real OAuth flow in production
    // For now, we'll simulate a successful authentication
    
    this.authData = {
      accessToken: 'simulated-google-access-token',
      refreshToken: 'simulated-google-refresh-token',
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      scope: 'https://www.googleapis.com/auth/calendar'
    };
    
    // Save token data
    this.saveAuthData();
    
    return true;
  }
  
  /**
   * Refresh the access token if it's expired
   */
  async refreshToken(): Promise<boolean> {
    if (!this.authData?.refreshToken) return false;
    
    // Simulate token refresh
    this.authData = {
      ...this.authData,
      accessToken: 'refreshed-google-access-token',
      expiresAt: Date.now() + 3600 * 1000 // 1 hour
    };
    
    // Save refreshed token
    this.saveAuthData();
    
    return true;
  }
  
  /**
   * Disconnect/logout from Google Calendar
   */
  async disconnect(): Promise<void> {
    this.authData = null;
    localStorage.removeItem('google_calendar_auth');
  }
  
  /**
   * Get the current auth data
   */
  getAuthData(): TokenInfo | null {
    return this.authData;
  }
  
  /**
   * Load auth data from storage
   */
  private loadAuthData(): void {
    const storedAuth = localStorage.getItem('google_calendar_auth');
    if (storedAuth) {
      try {
        this.authData = JSON.parse(storedAuth);
      } catch (e) {
        console.error('Failed to parse stored Google auth data');
        this.authData = null;
      }
    }
  }
  
  /**
   * Save auth data to storage
   */
  private saveAuthData(): void {
    if (this.authData) {
      localStorage.setItem('google_calendar_auth', JSON.stringify(this.authData));
    } else {
      localStorage.removeItem('google_calendar_auth');
    }
  }
  
  /**
   * Fetch all available calendars from Google
   */
  async fetchCalendars(): Promise<NormalizedCalendar[]> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // Simulated calendars data
    return [
      {
        id: 'primary',
        providerId: this.id,
        name: 'Primary Calendar',
        description: 'Your main Google Calendar',
        color: '#4285F4',
        isDefault: true,
        isReadOnly: false
      },
      {
        id: 'work',
        providerId: this.id,
        name: 'Work Calendar',
        description: 'Your work events',
        color: '#0F9D58',
        isDefault: false,
        isReadOnly: false
      },
      {
        id: 'holidays',
        providerId: this.id,
        name: 'Holidays',
        description: 'Public holidays',
        color: '#DB4437',
        isDefault: false,
        isReadOnly: true
      }
    ];
  }
  
  /**
   * Fetch events from a specific calendar
   */
  async fetchEvents(calendarId: string, options: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }): Promise<NormalizedEvent[]> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // Simulated events data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const sampleEvents = [
      {
        id: 'event1',
        calendarId,
        providerId: this.id,
        title: 'Team Meeting',
        description: 'Weekly team sync',
        location: 'Conference Room A',
        start: {
          dateTime: tomorrow,
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
          timeZone: 'UTC'
        },
        isAllDay: false,
        reminders: [
          {
            type: 'popup',
            minutes: 10,
            enabled: true,
            method: 'popup'
          }
        ],
        attendees: [
          {
            email: 'user@example.com',
            name: 'User Example',
            responseStatus: 'accepted'
          },
          {
            email: 'colleague@example.com',
            name: 'Colleague Example',
            responseStatus: 'tentative'
          }
        ],
        externalId: 'google-event-1',
        sourceUrl: 'https://calendar.google.com/event?id=event1',
        lastModified: now,
        lastSynced: now,
        metadata: {
          colorId: '1',
          visibility: 'private'
        }
      },
      {
        id: 'event2',
        calendarId,
        providerId: this.id,
        title: 'Project Deadline',
        description: 'Complete project deliverables',
        start: {
          dateTime: nextWeek,
          timeZone: 'UTC'
        },
        end: {
          dateTime: nextWeek,
          timeZone: 'UTC'
        },
        isAllDay: true,
        reminders: [
          {
            type: 'popup',
            minutes: 1440, // 1 day
            enabled: true,
            method: 'popup'
          }
        ],
        externalId: 'google-event-2',
        sourceUrl: 'https://calendar.google.com/event?id=event2',
        lastModified: now,
        lastSynced: now,
        metadata: {
          colorId: '4',
          visibility: 'public'
        }
      }
    ];
    
    return sampleEvents;
  }
  
  /**
   * Create a new event in Google Calendar
   */
  async createEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // Convert to Google format
    const googleEvent = this.fromNormalizedEvent(event);
    
    // In a real implementation, we would make an API call to Google
    // For now, simulate a successful creation by returning the event with a new ID
    return {
      ...event,
      id: `google-event-${Date.now()}`,
      externalId: `google-event-ext-${Date.now()}`,
      lastSynced: new Date()
    };
  }
  
  /**
   * Update an existing event in Google Calendar
   */
  async updateEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // Convert to Google format
    const googleEvent = this.fromNormalizedEvent(event);
    
    // In a real implementation, we would make an API call to Google
    // For now, simulate a successful update
    return {
      ...event,
      lastSynced: new Date()
    };
  }
  
  /**
   * Delete an event from Google Calendar
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // In a real implementation, we would make an API call to Google
    // For now, simulate a successful deletion
    return true;
  }
  
  /**
   * Convert a Google Calendar event to our normalized format
   */
  toNormalizedEvent(googleEvent: any): NormalizedEvent {
    const reminders: Reminder[] = [];
    
    if (googleEvent.reminders?.overrides) {
      googleEvent.reminders.overrides.forEach((override: any) => {
        reminders.push({
          type: override.method === 'email' ? 'email' : 'popup',
          minutes: override.minutes,
          enabled: true,
          method: override.method
        });
      });
    }
    
    const attendees: Attendee[] = [];
    
    if (googleEvent.attendees) {
      googleEvent.attendees.forEach((attendee: any) => {
        attendees.push({
          email: attendee.email,
          name: attendee.displayName,
          responseStatus: this.mapGoogleResponseStatus(attendee.responseStatus),
          optional: attendee.optional || false,
          organizer: attendee.organizer || false
        });
      });
    }
    
    let recurrence: RecurrencePattern[] | undefined = undefined;
    
    if (googleEvent.recurrence) {
      recurrence = [this.parseRecurrenceRule(googleEvent.recurrence[0])];
    }
    
    return {
      id: googleEvent.id,
      calendarId: googleEvent.calendarId || 'primary',
      providerId: this.id,
      title: googleEvent.summary || '',
      description: googleEvent.description || '',
      location: googleEvent.location,
      start: {
        dateTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
        timeZone: googleEvent.start.timeZone
      },
      end: {
        dateTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
        timeZone: googleEvent.end.timeZone
      },
      isAllDay: !!googleEvent.start.date,
      recurrence,
      attendees,
      reminders,
      externalId: googleEvent.id,
      sourceUrl: `https://calendar.google.com/calendar/event?eid=${googleEvent.id}`,
      lastModified: new Date(googleEvent.updated),
      lastSynced: new Date(),
      metadata: {
        colorId: googleEvent.colorId,
        visibility: googleEvent.visibility,
        status: googleEvent.status
      }
    };
  }
  
  /**
   * Convert our normalized event to Google Calendar format
   */
  fromNormalizedEvent(event: NormalizedEvent): any {
    const googleEvent: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: event.isAllDay ? 
        { date: this.formatDate(event.start.dateTime) } : 
        { 
          dateTime: event.start.dateTime.toISOString(),
          timeZone: event.start.timeZone || 'UTC'
        },
      end: event.isAllDay ? 
        { date: this.formatDate(event.end.dateTime) } : 
        { 
          dateTime: event.end.dateTime.toISOString(),
          timeZone: event.end.timeZone || 'UTC'
        },
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(reminder => ({
          method: reminder.method || reminder.type,
          minutes: reminder.minutes
        }))
      }
    };
    
    if (event.attendees && event.attendees.length > 0) {
      googleEvent.attendees = event.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: this.mapToGoogleResponseStatus(attendee.responseStatus),
        optional: attendee.optional
      }));
    }
    
    if (event.recurrence && event.recurrence.length > 0) {
      googleEvent.recurrence = [this.formatRecurrenceRule(event.recurrence[0])];
    }
    
    if (event.metadata) {
      if (event.metadata.colorId) {
        googleEvent.colorId = event.metadata.colorId;
      }
      
      if (event.metadata.visibility) {
        googleEvent.visibility = event.metadata.visibility;
      }
    }
    
    return googleEvent;
  }
  
  /**
   * Create an event from a task
   */
  async createEventFromTask(task: Task, calendarId: string): Promise<NormalizedEvent> {
    // Convert task to normalized event
    const event: NormalizedEvent = {
      id: '',
      calendarId,
      providerId: this.id,
      title: task.title,
      description: task.description,
      location: task.location,
      start: {
        dateTime: task.startTime || new Date(task.endTime.getTime() - 60 * 60 * 1000), // Default to 1 hour before due date
        timeZone: 'UTC'
      },
      end: {
        dateTime: task.endTime,
        timeZone: 'UTC'
      },
      isAllDay: task.isAllDay,
      reminders: task.reminders.map(r => ({
        type: r.type,
        minutes: r.minutes,
        enabled: r.enabled,
        method: r.method || 'popup'
      })),
      lastModified: task.updatedAt,
      lastSynced: new Date(),
      metadata: {
        taskId: task.id,
        priority: task.priority,
        tags: task.tags.join(',')
      }
    };
    
    // Add recurrence if task is recurring
    if (task.isRecurring && task.recurringPattern) {
      event.recurrence = [task.recurringPattern];
    }
    
    // Create the event in Google Calendar
    return await this.createEvent(calendarId, event);
  }
  
  /**
   * Update an event based on a task
   */
  async updateEventFromTask(task: Task, eventId: string, calendarId: string): Promise<NormalizedEvent> {
    // First, try to get the existing event
    const events = await this.fetchEvents(calendarId, {});
    const existingEvent = events.find(e => e.id === eventId);
    
    if (!existingEvent) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    // Update the event with task data
    const updatedEvent: NormalizedEvent = {
      ...existingEvent,
      title: task.title,
      description: task.description,
      location: task.location,
      start: {
        dateTime: task.startTime || new Date(task.endTime.getTime() - 60 * 60 * 1000),
        timeZone: existingEvent.start.timeZone
      },
      end: {
        dateTime: task.endTime,
        timeZone: existingEvent.end.timeZone
      },
      isAllDay: task.isAllDay,
      reminders: task.reminders.map(r => ({
        type: r.type,
        minutes: r.minutes,
        enabled: r.enabled,
        method: r.method || 'popup'
      })),
      lastModified: task.updatedAt,
      lastSynced: new Date(),
      metadata: {
        ...existingEvent.metadata,
        taskId: task.id,
        priority: task.priority,
        tags: task.tags.join(',')
      }
    };
    
    // Add recurrence if task is recurring
    if (task.isRecurring && task.recurringPattern) {
      updatedEvent.recurrence = [task.recurringPattern];
    }
    
    // Update the event in Google Calendar
    return await this.updateEvent(calendarId, updatedEvent);
  }
  
  /**
   * Check if webhooks are supported
   */
  supportsWebhooks(): boolean {
    return true;
  }
  
  /**
   * Register a webhook for a calendar
   */
  async registerWebhook(calendarId: string, webhookUrl: string): Promise<string> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // In a real implementation, we would make an API call to Google
    // to register a webhook notification
    // For now, simulate a successful registration
    return `webhook-${Date.now()}`;
  }
  
  /**
   * Remove a registered webhook
   */
  async removeWebhook(webhookId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Google');
      }
    }
    
    // In a real implementation, we would make an API call to Google
    // For now, simulate a successful removal
    return true;
  }
  
  // Helper methods
  
  /**
   * Format a date as YYYY-MM-DD for Google Calendar
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Map Google's response status to our normalized format
   */
  private mapGoogleResponseStatus(status?: string): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    switch (status) {
      case 'accepted': return 'accepted';
      case 'declined': return 'declined';
      case 'tentative': return 'tentative';
      default: return 'needsAction';
    }
  }
  
  /**
   * Map our response status to Google's format
   */
  private mapToGoogleResponseStatus(status?: 'accepted' | 'declined' | 'tentative' | 'needsAction'): string {
    switch (status) {
      case 'accepted': return 'accepted';
      case 'declined': return 'declined';
      case 'tentative': return 'tentative';
      default: return 'needsAction';
    }
  }
  
  /**
   * Parse a recurrence rule from Google's format
   */
  private parseRecurrenceRule(ruleString: string): RecurrencePattern {
    // Simple parser for RRULE format, e.g., "RRULE:FREQ=DAILY;COUNT=5"
    const rule: RecurrencePattern = {
      frequency: 'daily',
      interval: 1
    };
    
    const rrule = ruleString.replace('RRULE:', '');
    const parts = rrule.split(';');
    
    parts.forEach(part => {
      const [key, value] = part.split('=');
      
      switch (key) {
        case 'FREQ':
          rule.frequency = value.toLowerCase() as any;
          break;
        case 'INTERVAL':
          rule.interval = parseInt(value, 10);
          break;
        case 'COUNT':
          rule.count = parseInt(value, 10);
          break;
        case 'UNTIL':
          rule.until = new Date(value);
          break;
        case 'BYDAY':
          rule.byDay = value.split(',');
          break;
      }
    });
    
    return rule;
  }
  
  /**
   * Format a recurrence rule for Google Calendar
   */
  private formatRecurrenceRule(rule: RecurrencePattern): string {
    const parts = [`FREQ=${rule.frequency.toUpperCase()}`];
    
    if (rule.interval && rule.interval > 1) {
      parts.push(`INTERVAL=${rule.interval}`);
    }
    
    if (rule.count) {
      parts.push(`COUNT=${rule.count}`);
    }
    
    if (rule.until) {
      parts.push(`UNTIL=${rule.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    }
    
    if (rule.byDay && rule.byDay.length > 0) {
      parts.push(`BYDAY=${rule.byDay.join(',')}`);
    }
    
    return `RRULE:${parts.join(';')}`;
  }
}
