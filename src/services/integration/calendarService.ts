import type { Task } from '../../types';
import type { 
  NormalizedCalendar, 
  NormalizedEvent, 
  TokenInfo
} from '../../types/integration';

/**
 * Base interface for calendar service adapters
 * Provides a common set of methods that all calendar providers must implement
 */
export interface CalendarAdapter {
  /**
   * Provider identification info
   */
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  
  /**
   * Authentication methods
   */
  isAuthenticated(): boolean;
  authenticate(): Promise<boolean>;
  refreshToken(): Promise<boolean>;
  disconnect(): Promise<void>;
  getAuthData(): TokenInfo | null;
  
  /**
   * Calendar operations
   */
  fetchCalendars(): Promise<NormalizedCalendar[]>;
  
  /**
   * Event operations
   */
  fetchEvents(calendarId: string, options: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
  }): Promise<NormalizedEvent[]>;
  
  createEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent>;
  updateEvent(calendarId: string, event: NormalizedEvent): Promise<NormalizedEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<boolean>;
  
  /**
   * Conversion utilities
   */
  toNormalizedEvent(providerEvent: any): NormalizedEvent;
  fromNormalizedEvent(normalizedEvent: NormalizedEvent): any;
  
  /**
   * Task to event mapping
   */
  createEventFromTask(task: Task, calendarId: string): Promise<NormalizedEvent>;
  updateEventFromTask(task: Task, eventId: string, calendarId: string): Promise<NormalizedEvent>;
  
  /**
   * Webhook support
   */
  supportsWebhooks(): boolean;
  registerWebhook?(calendarId: string, webhookUrl: string): Promise<string>; // returns webhook id
  removeWebhook?(webhookId: string): Promise<boolean>;
}

/**
 * OAuth utilities for handling authentication
 */
export class AuthUtility {
  static generateOAuthUrl(
    clientId: string, 
    redirectUri: string, 
    scope: string[], 
    provider: 'google' | 'microsoft',
    state?: string
  ): string {
    switch (provider) {
      case 'google':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope.join(' '))}&access_type=offline&prompt=consent${state ? `&state=${encodeURIComponent(state)}` : ''}`;
      
      case 'microsoft':
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope.join(' '))}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  static async exchangeCodeForToken(
    code: string, 
    clientId: string, 
    clientSecret: string, 
    redirectUri: string, 
    provider: 'google' | 'microsoft'
  ): Promise<TokenInfo> {
    let url: string;
    let body: Record<string, string>;
    
    switch (provider) {
      case 'google':
        url = 'https://oauth2.googleapis.com/token';
        body = {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        };
        break;
      
      case 'microsoft':
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        body = {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        };
        break;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to exchange code for token');
      }
      
      const data = await response.json();
      
      // Calculate when the token expires
      const expiresAt = Date.now() + (data.expires_in * 1000);
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        scope: data.scope
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
  
  static async refreshAccessToken(
    refreshToken: string, 
    clientId: string, 
    clientSecret: string, 
    provider: 'google' | 'microsoft'
  ): Promise<TokenInfo> {
    let url: string;
    let body: Record<string, string>;
    
    switch (provider) {
      case 'google':
        url = 'https://oauth2.googleapis.com/token';
        body = {
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token'
        };
        break;
      
      case 'microsoft':
        url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        body = {
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token'
        };
        break;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to refresh token');
      }
      
      const data = await response.json();
      
      // Calculate when the token expires
      const expiresAt = Date.now() + (data.expires_in * 1000);
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return a new refresh token
        expiresAt,
        scope: data.scope
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  static async revokeToken(
    token: string, 
    clientId: string, 
    provider: 'google' | 'microsoft'
  ): Promise<boolean> {
    let url: string;
    let body: Record<string, string>;
    
    switch (provider) {
      case 'google':
        url = 'https://oauth2.googleapis.com/revoke';
        body = {
          token,
          client_id: clientId
        };
        break;
      
      case 'microsoft':
        // Microsoft doesn't have a standard token revocation endpoint
        // The best practice is to clear the token from your own storage
        return true;
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    try {
      if (provider === 'google') {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(body)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error_description || 'Failed to revoke token');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }
}
