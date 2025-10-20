/**
 * Auth0 Callback Handler
 *
 * This script runs BEFORE Angular to handle Auth0 callback hash
 * and prevent conflicts with Angular UI Router's hash routing.
 *
 * It parses the Auth0 hash, stores it in sessionStorage,
 * then clears the hash so Angular routing works normally.
 */

(function() {
    'use strict';

    console.log('[Callback Handler] Checking for Auth0 callback...');

    // Check if hash contains Auth0 tokens (regardless of page)
    var currentPath = window.location.hash;

    // Check if hash contains Auth0 tokens
    var hash = window.location.hash;
    var hasAccessToken = hash.indexOf('access_token=') !== -1;
    var hasIdToken = hash.indexOf('id_token=') !== -1;
    var hasError = hash.indexOf('error=') !== -1;

    if (!hasAccessToken && !hasIdToken && !hasError) {
        console.log('[Callback Handler] No Auth0 tokens in hash, skipping');
        return;
    }

    console.log('[Callback Handler] Auth0 callback detected! Extracting tokens...');

    // Extract the Auth0 hash fragment (everything after the first #)
    var fullHash = window.location.hash;
    var auth0Hash = '';

    // The hash might be in format: #!/callback#access_token=... or #!/callback#/access_token=...
    // We need to extract the part with access_token
    var parts = fullHash.split('#');
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('access_token=') !== -1 ||
            parts[i].indexOf('id_token=') !== -1 ||
            parts[i].indexOf('error=') !== -1) {
            auth0Hash = parts[i];
            break;
        }
    }

    if (!auth0Hash) {
        console.error('[Callback Handler] Could not extract Auth0 hash');
        return;
    }

    console.log('[Callback Handler] Auth0 hash extracted:', auth0Hash.substring(0, 50) + '...');

    // Store the Auth0 hash in sessionStorage for Auth0.js to parse
    sessionStorage.setItem('auth0_callback_hash', '#' + auth0Hash);

    // Store a flag to indicate we should process the callback
    sessionStorage.setItem('auth0_should_process_callback', 'true');

    // Also store a timestamp to debug
    var timestamp = new Date().toISOString();
    sessionStorage.setItem('auth0_callback_timestamp', timestamp);

    // Store original URL for debugging
    sessionStorage.setItem('auth0_original_url', window.location.href);

    console.log('[Callback Handler] ✅ Stored in sessionStorage:', {
        hash_length: auth0Hash.length,
        hash_preview: auth0Hash.substring(0, 50) + '...',
        should_process: 'true',
        timestamp: timestamp,
        original_url: window.location.href
    });

    // Verify storage worked
    var verifyHash = sessionStorage.getItem('auth0_callback_hash');
    var verifyFlag = sessionStorage.getItem('auth0_should_process_callback');

    if (!verifyHash || !verifyFlag) {
        console.error('[Callback Handler] ❌ CRITICAL: sessionStorage did not save correctly!');
        console.error('[Callback Handler] Stored hash:', verifyHash ? 'EXISTS' : 'NULL');
        console.error('[Callback Handler] Stored flag:', verifyFlag);
    } else {
        console.log('[Callback Handler] ✅ Verified: sessionStorage data saved successfully');
    }

    // Clear the hash and redirect to clean callback URL
    // This prevents hash conflicts with Angular routing
    console.log('[Callback Handler] Redirecting to clean callback URL in 100ms...');

    // Small delay to ensure sessionStorage is written
    setTimeout(function() {
        console.log('[Callback Handler] Now redirecting to #!/callback...');
        // Always redirect to #!/callback to trigger Angular's callback route
        window.location.href = window.location.origin + '#!/callback';
    }, 100);
})();
