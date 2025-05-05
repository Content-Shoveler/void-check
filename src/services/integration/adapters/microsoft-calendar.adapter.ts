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
 * Microsoft Calendar Adapter
 * Implements the CalendarAdapter interface for Microsoft Graph API (Outlook/Microsoft 365 Calendar)
 */
export class MicrosoftCalendarAdapter implements CalendarAdapter {
  readonly id = 'microsoft';
  readonly name = 'Microsoft Calendar';
  readonly description = 'Connect to your Outlook or Microsoft 365 Calendar';
  readonly icon = 'microsoft';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authData: TokenInfo | null = null;
  
  constructor(config: { clientId: string; clientSecret: string; redirectUri: string }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.loadAuthData();
  }
  
  /**
   * Check if the user is authenticated with Microsoft
   */
  isAuthenticated(): boolean {
    if (!this.authData) return false;
    return Date.now() < this.authData.expiresAt;
  }
  
  /**
   * Start the OAuth flow to authenticate with Microsoft
   */
  async authenticate(): Promise<boolean> {
    // This would be implemented with a real OAuth flow in production
    // For now, we'll simulate a successful authentication
    
    this.authData = {
      accessToken: 'simulated-microsoft-access-token',
      refreshToken: 'simulated-microsoft-refresh-token',
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      scope: 'Calendars.ReadWrite User.Read'
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
      accessToken: 'refreshed-microsoft-access-token',
      expiresAt: Date.now() + 3600 * 1000 // 1 hour
    };
    
    // Save refreshed token
    this.saveAuthData();
    
    return true;
  }
  
  /**
   * Disconnect/logout from Microsoft Calendar
   */
  async disconnect(): Promise<void> {
    this.authData = null;
    localStorage.removeItem('microsoft_calendar_auth');
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
    const storedAuth = localStorage.getItem('microsoft_calendar_auth');
    if (storedAuth) {
      try {
        this.authData = JSON.parse(storedAuth);
      } catch (e) {
        console.error('Failed to parse stored Microsoft auth data');
        this.authData = null;
      }
    }
  }
  
  /**
   * Save auth data to storage
   */
  private saveAuthData(): void {
    if (this.authData) {
      localStorage.setItem('microsoft_calendar_auth', JSON.stringify(this.authData));
    } else {
      localStorage.removeItem('microsoft_calendar_auth');
    }
  }
  
  /**
   * Fetch all available calendars from Microsoft
   */
  async fetchCalendars(): Promise<NormalizedCalendar[]> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // Simulated calendars data
    return [
      {
        id: 'primary',
        providerId: this.id,
        name: 'Calendar',
        description: 'Your primary Outlook calendar',
        color: '#0078D4',
        isDefault: true,
        isReadOnly: false
      },
      {
        id: 'work',
        providerId: this.id,
        name: 'Work Calendar',
        description: 'Your work meetings and events',
        color: '#107C10',
        isDefault: false,
        isReadOnly: false
      },
      {
        id: 'personal',
        providerId: this.id,
        name: 'Personal',
        description: 'Personal appointments',
        color: '#FFB900',
        isDefault: false,
        isReadOnly: false
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
        throw new Error('Not authenticated with Microsoft');
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
        title: 'Project Review',
        description: 'Quarterly project review meeting',
        location: 'Conference Room B',
        start: {
          dateTime: tomorrow,
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(tomorrow.getTime() + 90 * 60 * 1000), // 1.5 hours
          timeZone: 'UTC'
        },
        isAllDay: false,
        reminders: [
          {
            type: 'popup',
            minutes: 15,
            enabled: true,
            method: 'popup'
          }
        ],
        attendees: [
          {
            email: 'user@example.com',
            name: 'User Example',
            responseStatus: 'accepted' as const
          },
          {
            email: 'manager@example.com',
            name: 'Manager Example',
            responseStatus: 'accepted' as const
          }
        ],
        externalId: 'microsoft-event-1',
        sourceUrl: 'https://outlook.office.com/calendar/item/event1',
        lastModified: now,
        lastSynced: now,
        metadata: {
          importance: 'normal',
          sensitivity: 'normal'
        }
      },
      {
        id: 'event2',
        calendarId,
        providerId: this.id,
        title: 'Sprint Planning',
        description: 'Plan work for next sprint',
        location: 'Teams Meeting',
        start: {
          dateTime: nextWeek,
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(nextWeek.getTime() + 60 * 60 * 1000), // 1 hour
          timeZone: 'UTC'
        },
        isAllDay: false,
        reminders: [
          {
            type: 'popup',
            minutes: 5,
            enabled: true,
            method: 'popup'
          }
        ],
        attendees: [
          {
            email: 'user@example.com',
            name: 'User Example',
            responseStatus: 'tentative' as const
          },
          {
            email: 'team@example.com',
            name: 'Team Example',
            responseStatus: 'needsAction' as const
          }
        ],
        externalId: 'microsoft-event-2',
        sourceUrl: 'https://outlook.office.com/calendar/item/event2',
        lastModified: now,
        lastSynced: now,
        metadata: {
          importance: 'high',
          sensitivity: 'normal'
        }
      }
    ];
    
    return sampleEvents;
  }
  
  /**
   * Create a new event in Microsoft Calendar
   */
  async createEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // Convert to Microsoft format
    const microsoftEvent = this.fromNormalizedEvent(event);
    
    // In a real implementation, we would make an API call to Microsoft
    // For now, simulate a successful creation by returning the event with a new ID
    return {
      ...event,
      id: `microsoft-event-${Date.now()}`,
      externalId: `microsoft-event-ext-${Date.now()}`,
      lastSynced: new Date()
    };
  }
  
  /**
   * Update an existing event in Microsoft Calendar
   */
  async updateEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // Convert to Microsoft format
    const microsoftEvent = this.fromNormalizedEvent(event);
    
    // In a real implementation, we would make an API call to Microsoft
    // For now, simulate a successful update
    return {
      ...event,
      lastSynced: new Date()
    };
  }
  
  /**
   * Delete an event from Microsoft Calendar
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      await this.refreshToken();
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // In a real implementation, we would make an API call to Microsoft
    // For now, simulate a successful deletion
    return true;
  }
  
  /**
   * Convert a Microsoft Calendar event to our normalized format
   */
  toNormalizedEvent(microsoftEvent: any): NormalizedEvent {
    const reminders: Reminder[] = [];
    
    if (microsoftEvent.reminderMinutesBeforeStart !== undefined) {
      reminders.push({
        type: 'popup',
        minutes: microsoftEvent.reminderMinutesBeforeStart,
        enabled: microsoftEvent.isReminderOn,
        method: 'popup'
      });
    }
    
    const attendees: Attendee[] = [];
    
    if (microsoftEvent.attendees) {
      microsoftEvent.attendees.forEach((attendee: any) => {
        attendees.push({
          email: attendee.emailAddress.address,
          name: attendee.emailAddress.name,
          responseStatus: this.mapMicrosoftResponseStatus(attendee.status.response),
          optional: attendee.type === 'optional',
          organizer: attendee.type === 'organizer'
        });
      });
    }
    
    return {
      id: microsoftEvent.id,
      calendarId: microsoftEvent.calendarId || 'primary',
      providerId: this.id,
      title: microsoftEvent.subject || '',
      description: microsoftEvent.bodyPreview || '',
      location: microsoftEvent.location?.displayName,
      start: {
        dateTime: new Date(microsoftEvent.start.dateTime),
        timeZone: microsoftEvent.start.timeZone
      },
      end: {
        dateTime: new Date(microsoftEvent.end.dateTime),
        timeZone: microsoftEvent.end.timeZone
      },
      isAllDay: microsoftEvent.isAllDay,
      reminders,
      attendees,
      externalId: microsoftEvent.id,
      sourceUrl: microsoftEvent.webLink,
      lastModified: new Date(microsoftEvent.lastModifiedDateTime),
      lastSynced: new Date(),
      metadata: {
        importance: microsoftEvent.importance,
        sensitivity: microsoftEvent.sensitivity
      }
    };
  }
  
  /**
   * Convert our normalized event to Microsoft Calendar format
   */
  fromNormalizedEvent(event: NormalizedEvent): any {
    const microsoftEvent: any = {
      subject: event.title,
      body: {
        contentType: 'text',
        content: event.description
      },
      start: {
        dateTime: event.start.dateTime.toISOString(),
        timeZone: event.start.timeZone || 'UTC'
      },
      end: {
        dateTime: event.end.dateTime.toISOString(),
        timeZone: event.end.timeZone || 'UTC'
      },
      isAllDay: event.isAllDay
    };
    
    if (event.location) {
      microsoftEvent.location = {
        displayName: event.location
      };
    }
    
    if (event.reminders && event.reminders.length > 0) {
      microsoftEvent.isReminderOn = event.reminders[0].enabled;
      microsoftEvent.reminderMinutesBeforeStart = event.reminders[0].minutes;
    }
    
    if (event.attendees && event.attendees.length > 0) {
      microsoftEvent.attendees = event.attendees.map(attendee => ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name
        },
        type: attendee.optional ? 'optional' : 'required',
        status: {
          response: this.mapToMicrosoftResponseStatus(attendee.responseStatus)
        }
      }));
    }
    
    if (event.metadata) {
      if (event.metadata.importance) {
        microsoftEvent.importance = event.metadata.importance;
      }
      
      if (event.metadata.sensitivity) {
        microsoftEvent.sensitivity = event.metadata.sensitivity;
      }
    }
    
    return microsoftEvent;
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
    
    // Create the event in Microsoft Calendar
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
    
    // Update the event in Microsoft Calendar
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
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // In a real implementation, we would make an API call to Microsoft
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
        throw new Error('Not authenticated with Microsoft');
      }
    }
    
    // In a real implementation, we would make an API call to Microsoft
    // For now, simulate a successful removal
    return true;
  }
  
  // Helper methods
  
  /**
   * Map Microsoft's response status to our normalized format
   */
  private mapMicrosoftResponseStatus(status?: string): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    switch (status) {
      case 'accepted': return 'accepted';
      case 'declined': return 'declined';
      case 'tentativelyAccepted': return 'tentative';
      default: return 'needsAction';
    }
  }
  
  /**
   * Map our response status to Microsoft's format
   */
  private mapToMicrosoftResponseStatus(status?: 'accepted' | 'declined' | 'tentative' | 'needsAction'): string {
    switch (status) {
      case 'accepted': return 'accepted';
      case 'declined': return 'declined';
      case 'tentative': return 'tentativelyAccepted';
      default: return 'notResponded';
    }
  }
}
