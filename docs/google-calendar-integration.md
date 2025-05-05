# Google Calendar Integration Setup Guide

This document provides a comprehensive guide for setting up the Google Calendar integration for the Void-Check application, specifically for production deployment on Render.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Production Setup](#production-setup)
  - [Google Cloud Platform Configuration](#google-cloud-platform-configuration)
  - [Application Code Updates](#application-code-updates)
  - [Render Configuration](#render-configuration)
  - [Testing and Verification](#testing-and-verification)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

The application is configured with a simulated Google Calendar integration for local development:

- Mock credentials are used (`mock-google-client-id` and `mock-google-api-key`)
- Authentication flow is simulated to always succeed
- Sample calendars and events are hardcoded

This allows you to test the UI and functionality without setting up real Google API connections.

## Production Setup

### Google Cloud Platform Configuration

1. **Create a Google Cloud Platform project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Click "New Project" and name it (e.g., "Void-Check Calendar Integration")
   - Click "Create"

2. **Enable the Google Calendar API**
   - From your project dashboard, go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click on it and then click "Enable"

3. **Configure the OAuth consent screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type (unless you have Google Workspace)
   - Fill in required information:
     - App name: "Void-Check"
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue"
   - Add scopes: search for calendar and select the following:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Click "Save and Continue"
   - Add test users (including your own email)
   - Click "Save and Continue" then "Back to Dashboard"

4. **Create OAuth credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Void-Check Web Client"
   - Authorized JavaScript origins: 
     - Add your Render domain (e.g., `https://void-check.onrender.com`)
     - Add `http://localhost:3000` for local testing
   - Authorized redirect URIs:
     - Add `https://your-render-domain.onrender.com/auth/google/callback`
     - Add `http://localhost:3000/auth/google/callback` for local testing
   - Click "Create"
   - Note down the Client ID and Client Secret

5. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Note down the API Key
   - Restrict the API key (optional but recommended):
     - Click on the newly created API key
     - Under "API restrictions," select "Restrict key"
     - Select "Google Calendar API" from the dropdown
     - Click "Save"

### Application Code Updates

1. **Update the integration service configuration**
   - Open `src/services/integration-service.ts`
   - Locate the `registerDefaultAdapters` method
   - Update the Google Calendar adapter configuration:

   ```typescript
   // Update this code section
   this.registerAdapter(new GoogleCalendarAdapter({
     clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
     apiKey: process.env.GOOGLE_API_KEY || 'mock-google-api-key'
   }));
   ```

2. **Add environment variables handling**
   - Create a `.env` file in your project root (for local development)
   - Add the following entries:

   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_API_KEY=your_api_key_here
   REDIRECT_URI=http://localhost:3000/auth/google/callback  # for local dev
   ```

3. **Update OAuth implementation in the adapter**
   - Open `src/services/integration/adapters/google-calendar.adapter.ts`
   - Modify the `authenticate` method to use real OAuth flow:

   ```typescript
   async authenticate(): Promise<boolean> {
     // Use the AuthUtility to generate an OAuth URL
     const authUrl = AuthUtility.generateOAuthUrl(
       this.clientId,
       process.env.REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
       ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
       'google',
       // Optional state parameter for security
       btoa(Math.random().toString(36))
     );
     
     // Open the auth URL in a new window or redirect
     window.open(authUrl, '_blank', 'width=800,height=600');
     
     // Note: You'll need to implement a way to handle the OAuth callback
     // This is usually done with a route that receives the code
     // For now, this is simplified
     
     return true; // This should actually wait for the OAuth flow to complete
   }
   ```

4. **Create an OAuth callback handler**
   - Create a new route in your application to handle the OAuth callback
   - This will receive the authorization code and exchange it for tokens

### Render Configuration

1. **Set up your project on Render**
   - Sign in to [Render](https://render.com/)
   - Create a new Web Service
   - Connect your GitHub repository
   - Configure the build settings:
     - Build Command: `yarn && yarn build`
     - Start Command: Typically something like `node server.js` or your server startup

2. **Configure environment variables on Render**
   - In your Render dashboard, go to your web service
   - Navigate to "Environment" tab
   - Add the following environment variables:
     - `GOOGLE_CLIENT_ID`: Your Google Cloud client ID
     - `GOOGLE_API_KEY`: Your Google Cloud API key
     - `REDIRECT_URI`: `https://your-render-domain.onrender.com/auth/google/callback`
   - Click "Save Changes"

3. **Deploy your application**
   - Trigger a deploy in Render (automatic if you have auto-deploy enabled)
   - Wait for the build and deployment to complete

### Testing and Verification

1. **Test the integration**
   - Visit your deployed application
   - Navigate to the Integrations page
   - Attempt to connect to Google Calendar
   - Verify that the OAuth flow works correctly
   - Check that calendars are fetched correctly

2. **Monitor for issues**
   - Check your application logs on Render
   - Monitor for any authentication or API errors
   - Adjust configurations as needed

## Security Considerations

1. **Never commit API keys or client secrets to your repository**
   - Always use environment variables
   - Add `.env` to `.gitignore`

2. **Restrict API access**
   - Limit your API key to only the required Google APIs
   - Set appropriate redirect URIs for OAuth

3. **Use secure storage for tokens**
   - Consider server-side storage for refresh tokens if possible
   - Encrypt sensitive data when stored in localStorage

## Troubleshooting

### Common Issues and Solutions

1. **Authentication fails**
   - Verify that your client ID and API key are correct
   - Check that your redirect URI matches exactly what's configured in Google Cloud
   - Ensure that the Google Calendar API is enabled

2. **Calendars not displaying**
   - Check browser console for errors
   - Verify that the access token hasn't expired
   - Look for CORS issues if accessing from different domains

3. **API quota exceeded**
   - Google Calendar API has usage limits
   - Consider implementing caching strategies
   - Monitor your API usage in Google Cloud Console

4. **Refresh token invalid**
   - Refresh tokens can expire if not used for an extended period
   - Implement proper error handling to direct users to re-authenticate when needed
