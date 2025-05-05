# Microsoft Calendar Integration Setup Guide

This document provides a comprehensive guide for setting up the Microsoft Calendar integration for the Void-Check application, specifically for production deployment on Render.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Production Setup](#production-setup)
  - [Microsoft Azure Portal Configuration](#microsoft-azure-portal-configuration)
  - [Application Code Updates](#application-code-updates)
  - [Render Configuration](#render-configuration)
  - [Testing and Verification](#testing-and-verification)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

The application is configured with a simulated Microsoft Calendar integration for local development:

- Mock credentials are used (`mock-microsoft-client-id` and `mock-microsoft-client-secret`)
- Authentication flow is simulated to always succeed
- Sample calendars and events are hardcoded

This allows you to test the UI and functionality without setting up real Microsoft API connections.

## Production Setup

### Microsoft Azure Portal Configuration

1. **Register an application in Azure Active Directory**
   - Sign in to the [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Enter an application name (e.g., "Void-Check")
   - Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"
   - Set the Redirect URI:
     - Platform: "Web"
     - URL: `https://your-render-domain.onrender.com/auth/microsoft/callback`
   - Click "Register"

2. **Configure app permissions**
   - From your app's overview page, click on "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"
   - Add the following permissions:
     - `Calendars.Read`
     - `Calendars.ReadWrite`
     - `User.Read`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you have admin rights)

3. **Create a client secret**
   - From your app's overview page, click on "Certificates & secrets"
   - Under "Client secrets", click "New client secret"
   - Add a description and select an expiration period
   - Click "Add"
   - **Important**: Copy the generated secret value immediately, as you won't be able to see it again

4. **Make note of important information**
   - Application (client) ID: found on the app overview page
   - Directory (tenant) ID: found on the app overview page
   - Client secret: the value you copied in the previous step

### Application Code Updates

1. **Update the integration service configuration**
   - Open `src/services/integration-service.ts`
   - Locate the `registerDefaultAdapters` method
   - Update the Microsoft Calendar adapter configuration:

   ```typescript
   // Update this code section
   this.registerAdapter(new MicrosoftCalendarAdapter({
     clientId: process.env.MICROSOFT_CLIENT_ID || 'mock-microsoft-client-id',
     clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'mock-microsoft-client-secret',
     redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback'
   }));
   ```

2. **Add environment variables handling**
   - Create a `.env` file in your project root (for local development)
   - Add the following entries:

   ```
   MICROSOFT_CLIENT_ID=your_client_id_here
   MICROSOFT_CLIENT_SECRET=your_client_secret_here
   MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback  # for local dev
   ```

3. **Update OAuth implementation in the adapter**
   - Open `src/services/integration/adapters/microsoft-calendar.adapter.ts`
   - Modify the `authenticate` method to use real OAuth flow:

   ```typescript
   async authenticate(): Promise<boolean> {
     // Use the AuthUtility to generate an OAuth URL
     const authUrl = AuthUtility.generateOAuthUrl(
       this.clientId,
       this.redirectUri,
       ['Calendars.Read', 'Calendars.ReadWrite', 'User.Read'],
       'microsoft',
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
     - `MICROSOFT_CLIENT_ID`: Your Azure app client ID
     - `MICROSOFT_CLIENT_SECRET`: Your Azure app client secret
     - `MICROSOFT_REDIRECT_URI`: `https://your-render-domain.onrender.com/auth/microsoft/callback`
   - Click "Save Changes"

3. **Deploy your application**
   - Trigger a deploy in Render (automatic if you have auto-deploy enabled)
   - Wait for the build and deployment to complete

### Testing and Verification

1. **Test the integration**
   - Visit your deployed application
   - Navigate to the Integrations page
   - Attempt to connect to Microsoft Calendar
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

2. **Restrict app permissions**
   - Only request the minimum permissions needed for your application
   - Consider implementing incremental consent if all permissions aren't needed upfront

3. **Implement proper token storage**
   - Consider server-side storage for refresh tokens if possible
   - Encrypt sensitive data when stored in localStorage

4. **Set appropriate token lifetimes**
   - Configure reasonable access token lifetimes in Azure AD
   - Implement proper refresh token handling in your application

## Troubleshooting

### Common Issues and Solutions

1. **Authentication fails**
   - Verify that your client ID and client secret are correct
   - Check that your redirect URI matches exactly what's configured in Azure
   - Ensure that the necessary API permissions are granted

2. **Calendars not displaying**
   - Check browser console for errors
   - Verify that the access token hasn't expired
   - Look for CORS issues if accessing from different domains

3. **Permission issues**
   - Ensure that the appropriate Microsoft Graph permissions are granted
   - For multi-tenant apps, verify that admin consent has been provided

4. **Token refresh failures**
   - Microsoft tokens have specific expiration rules
   - Implement robust error handling to detect and respond to token expiration
   - Redirect users to re-authenticate when necessary

5. **Rate limiting or throttling**
   - Microsoft Graph API has usage limits
   - Implement retry mechanisms with exponential backoff
   - Consider caching frequently accessed data
