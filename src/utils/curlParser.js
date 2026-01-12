// Decode cmd escape sequences (^ escapes special characters)
const decodeCmdEscapes = (str) => {
  return str
    .replace(/\^&/g, '&')      // ^& → &
    .replace(/\^%/g, '%')      // ^% → %
    .replace(/\^\^/g, '^')     // ^^ → ^
    .replace(/\^</g, '<')      // ^< → <
    .replace(/\^>/g, '>')      // ^> → >
    .replace(/\^\|/g, '|')     // ^| → |
    .replace(/\^([a-zA-Z0-9])/g, '$1'); // Remove ^ before alphanumeric chars (unnecessary escapes)
};

// Manual parameter parsing fallback for complex cases
const parseQueryString = (queryString) => {
  const params = [];
  if (!queryString) return params;

  // Handle both & and ^& separators (cmd escaped)
  const pairs = queryString.split(/&|\^&/).filter(Boolean);

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=');
    const value = valueParts.join('=');
    if (key) {
      try {
        params.push({
          key: decodeURIComponent(key),
          value: decodeURIComponent(value || ''),
          enabled: true
        });
      } catch {
        // If URI decoding fails, use raw values
        params.push({
          key,
          value: value || '',
          enabled: true
        });
      }
    }
  }
  return params;
};

export const parseCurl = (curlCommand) => {
  try {
    // Clean up the command - remove backslashes and normalize whitespace
    let cleaned = curlCommand.replace(/\\/g, '').replace(/\s+/g, ' ').trim();

    // Extract method
    let method = 'GET';
    const methodMatch = cleaned.match(/-X\s+(\w+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
      cleaned = cleaned.replace(/-X\s+\w+/i, '');
    }

    // Extract headers
    const headers = [];
    const headerRegex = /-H\s+["']([^"']+)["']/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(cleaned)) !== null) {
      const headerStr = headerMatch[1];
      const colonIndex = headerStr.indexOf(':');
      if (colonIndex !== -1) {
        const key = headerStr.substring(0, colonIndex).trim();
        const value = headerStr.substring(colonIndex + 1).trim();
        headers.push({ key, value, enabled: true });
      }
    }
    cleaned = cleaned.replace(headerRegex, '');

    // Extract body/data
    let body = '';
    const dataIndex = cleaned.indexOf('-d ');
    if (dataIndex !== -1) {
      const afterD = cleaned.substring(dataIndex + 3).trim();
      let endIndex = afterD.length;
      if (afterD.startsWith('"')) {
        const closingQuote = afterD.indexOf('"', 1);
        if (closingQuote !== -1) {
          endIndex = closingQuote + 1;
        }
      } else if (afterD.startsWith("'")) {
        const closingQuote = afterD.indexOf("'", 1);
        if (closingQuote !== -1) {
          endIndex = closingQuote + 1;
        }
      } else {
        // Unquoted, find next space
        const spaceIndex = afterD.indexOf(' ');
        if (spaceIndex !== -1) {
          endIndex = spaceIndex;
        }
      }
      body = afterD.substring(0, endIndex).replace(/^["']|["']$/g, '');

      // Apply cmd escape decoding to body
      body = decodeCmdEscapes(body);

      // Try to decode body if it looks like URL-encoded data
      try {
        if (body && body.includes('=') && !body.startsWith('{') && !body.startsWith('[')) {
          // Might be form data, decode it
          body = decodeURIComponent(body);
        }
      } catch {
        // Keep original body if decoding fails
      }

      // Remove the -d part from cleaned string
      const dPart = cleaned.substring(dataIndex).split(' ')[0] + ' ' + afterD.substring(0, endIndex);
      cleaned = cleaned.replace(dPart, '');
    }

    // Extract URL - find the first URL-like string, excluding trailing quotes
    const urlRegex = /(https?:\/\/[^"\s]+)/;
    const urlMatch = urlRegex.exec(cleaned);
    let rawUrl = '';
    if (urlMatch) {
      rawUrl = urlMatch[1];
    }

    // Decode cmd escapes in URL first
    let decodedUrl = decodeCmdEscapes(rawUrl);

    // Clean up any remaining trailing escape characters
    decodedUrl = decodedUrl.replace(/\^$/, ''); // Remove trailing ^

    // Extract query parameters from decoded URL
    let params = [];
    let url = decodedUrl;
    try {
      const urlObj = new URL(decodedUrl);
      params = Array.from(urlObj.searchParams.entries()).map(([key, value]) => {
        try {
          return {
            key,
            value: decodeURIComponent(value), // URL-decode parameter values
            enabled: true
          };
        } catch {
          return {
            key,
            value, // Keep original if decoding fails
            enabled: true
          };
        }
      });
      // Remove query params from URL
      url = urlObj.origin + urlObj.pathname;
    } catch {
      // URL parsing failed, try manual parameter extraction
      const queryIndex = decodedUrl.indexOf('?');
      if (queryIndex !== -1) {
        url = decodedUrl.substring(0, queryIndex);
        const queryString = decodedUrl.substring(queryIndex + 1);
        params = parseQueryString(queryString);
      }
    }

    return {
      method,
      url,
      headers,
      params,
      body
    };
  } catch (error) {
    throw new Error(`Invalid curl command: ${error.message}`);
  }
};