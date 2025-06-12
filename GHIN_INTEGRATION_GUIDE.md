# GHIN API Integration Guide

## Overview

This guide explains how to integrate the GHIN (Golf Handicap and Information Network) API into your golf improvement app. The integration allows users to automatically import their official golf scores and handicap data, eliminating manual entry and providing accurate performance tracking.

## Prerequisites

Before implementing GHIN integration, you'll need:

1. **GHIN API Access**: Contact GHIN/USGA to obtain API credentials
   - Client ID (`GHIN_CLIENT_ID`)
   - Client Secret (`GHIN_CLIENT_SECRET`)
   - API Base URL (`GHIN_API_BASE_URL`)

2. **OAuth 2.0 Understanding**: GHIN uses OAuth 2.0 for secure authentication

3. **SSL Certificate**: GHIN requires HTTPS for all OAuth redirects

## Environment Variables

Add these environment variables to your deployment:

```bash
GHIN_CLIENT_ID=your_client_id_here
GHIN_CLIENT_SECRET=your_client_secret_here
GHIN_API_BASE_URL=https://api.ghin.com/api/v1
```

## Integration Architecture

### 1. Database Schema Updates

The user table has been extended with GHIN-specific fields:

```sql
-- Additional fields in users table
ghinNumber: text("ghin_number")                -- User's GHIN number
ghinConnected: boolean("ghin_connected")       -- Connection status
ghinAccessToken: text("ghin_access_token")     -- OAuth access token
ghinRefreshToken: text("ghin_refresh_token")   -- OAuth refresh token
lastGhinSync: timestamp("last_ghin_sync")      -- Last data sync timestamp
```

### 2. Backend API Implementation

The backend includes a complete GHIN API client (`server/ghin-api.ts`) with:

- **OAuth 2.0 Flow**: Handles authorization and token management
- **Score Retrieval**: Fetches recent golf rounds
- **Handicap Tracking**: Gets current official handicap
- **Data Conversion**: Converts GHIN data to internal format
- **Error Handling**: Manages API failures and token refresh

### 3. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ghin/auth-url` | GET | Generate OAuth authorization URL |
| `/api/ghin/callback` | GET | Handle OAuth callback |
| `/api/ghin/sync` | POST | Sync latest GHIN data |
| `/api/ghin/disconnect` | POST | Disconnect GHIN account |

## Onboarding Flow Step-by-Step

### Step 1: User Initiates Connection

1. User visits the `/onboarding` page
2. Sees benefits of GHIN integration:
   - Automatic score import
   - Real-time handicap updates
   - Enhanced practice recommendations
   - No manual data entry

3. Clicks "Connect Your GHIN Account" button

### Step 2: OAuth Authorization

1. Frontend calls `/api/ghin/auth-url`
2. Backend generates authorization URL with:
   - Client ID
   - Redirect URI
   - Required scopes (`profile scores`)
   - State parameter for security

3. User redirected to GHIN's authorization server
4. User enters GHIN credentials and grants permission

### Step 3: Authorization Callback

1. GHIN redirects to `/api/ghin/callback` with authorization code
2. Backend exchanges code for access/refresh tokens
3. Backend fetches user's GHIN profile data
4. User record updated with:
   - GHIN number
   - Connection status
   - OAuth tokens
   - Current handicap (if available)

5. User redirected to success page

### Step 4: Initial Data Sync

1. Backend automatically fetches recent scores (last 90 days)
2. Converts GHIN score format to internal round format:
   ```javascript
   {
     userId: number,
     date: Date,
     courseName: string,
     totalScore: number,
     courseRating: string,
     slopeRating: number,
     differential: string,
     // GHIN doesn't provide detailed stats
     fairwaysHit: null,
     greensInRegulation: null,
     totalPutts: null,
     penalties: null
   }
   ```

3. Rounds saved to database with `processed: true`
4. Handicap updated if newer than current

### Step 5: Ongoing Synchronization

**Automatic Sync Triggers:**
- When generating new practice plans
- When user manually clicks "Sync Now"
- Scheduled background sync (if implemented)

**Sync Process:**
1. Check last sync timestamp
2. Fetch scores since last sync
3. Import new rounds
4. Update handicap if changed
5. Update sync timestamp

## Frontend Implementation

### GHIN Onboarding Component

The `GhinOnboarding` component provides:

- **Connection Status**: Shows whether GHIN is connected
- **Benefits Explanation**: Clear value proposition
- **Privacy Assurance**: Security and data usage information
- **Step-by-Step Guide**: How the process works
- **Connection Button**: Initiates OAuth flow
- **Sync Controls**: Manual sync and disconnect options

### Connection States

1. **Not Connected**: Shows benefits and connection button
2. **Connecting**: Loading state during OAuth flow
3. **Connected**: Shows status, sync controls, and disconnect option
4. **Error**: Displays error message with retry option

## Security Considerations

### Token Management

- **Access Tokens**: Short-lived, used for API calls
- **Refresh Tokens**: Long-lived, used to get new access tokens
- **Automatic Refresh**: Handled transparently when access tokens expire
- **Secure Storage**: Tokens stored encrypted in database

### Data Privacy

- **Minimal Data Access**: Only golf scores and handicap information
- **No Credential Storage**: User login credentials never stored
- **Opt-out Available**: Users can disconnect anytime
- **Transparent Usage**: Clear explanation of what data is accessed

### Error Handling

- **Token Expiry**: Automatic refresh with fallback to re-authentication
- **API Failures**: Graceful degradation with user notification
- **Network Issues**: Retry logic with exponential backoff
- **User Feedback**: Clear error messages and recovery instructions

## Practice Plan Enhancement

GHIN integration enhances practice plan generation by:

1. **Accurate Performance Data**: Uses official scores vs. self-reported
2. **Trend Analysis**: Identifies improvement patterns over time
3. **Weakness Identification**: Pinpoints specific areas needing work
4. **Goal Setting**: Sets realistic targets based on handicap trends
5. **Progress Tracking**: Measures improvement against official handicap

## Testing the Integration

### Development Testing

1. **Mock GHIN API**: Create test endpoints mimicking GHIN responses
2. **OAuth Simulation**: Test authorization flow with dummy data
3. **Error Scenarios**: Test network failures, invalid tokens, etc.
4. **Data Validation**: Ensure proper conversion of GHIN to internal format

### Production Testing

1. **Staging Environment**: Test with real GHIN API in controlled environment
2. **Limited Beta**: Invite select users to test integration
3. **Monitoring**: Track API usage, error rates, and user feedback
4. **Performance**: Monitor impact on app performance and database

## Deployment Checklist

- [ ] GHIN API credentials configured
- [ ] SSL certificate installed
- [ ] Database migration completed
- [ ] Error monitoring setup
- [ ] User communication prepared
- [ ] Support documentation updated
- [ ] Backup and rollback plan ready

## Troubleshooting Common Issues

### OAuth Failures
- Verify redirect URI matches exactly
- Check SSL certificate validity
- Confirm client credentials are correct

### API Errors
- Monitor rate limits and quotas
- Verify token refresh logic
- Check for GHIN API status updates

### Data Sync Issues
- Validate date format conversions
- Handle missing or invalid score data
- Ensure proper error logging

## Future Enhancements

1. **Real-time Sync**: Webhook integration for immediate updates
2. **Historical Import**: Import complete score history
3. **Tournament Data**: Include tournament rounds and performance
4. **Peer Comparison**: Compare with other golfers (anonymized)
5. **Handicap Projection**: Predict future handicap based on trends

## Support and Maintenance

- **API Changes**: Monitor GHIN for API updates and deprecations
- **Token Rotation**: Implement secure token rotation policies
- **User Support**: Provide clear instructions for common issues
- **Documentation**: Keep integration guide updated with changes

This comprehensive GHIN integration provides seamless onboarding while maintaining security and user privacy, significantly enhancing the golf improvement app's value proposition.