interface KeyValueItem {
  key: string
  value: string
  enabled: boolean
}

interface ParsedCurl {
  method: string
  url: string
  headers: KeyValueItem[]
  params: KeyValueItem[]
  body: string
}

const decodeCmdEscapes = (str: string): string => {
  return str
    .replace(/\^&/g, '&')
    .replace(/\^%/g, '%')
    .replace(/\^\^/g, '^')
    .replace(/\^</g, '<')
    .replace(/\^>/g, '>')
    .replace(/\^\|/g, '|')
    .replace(/\^"/g, '"')
    .replace(/\^'/g, "'")
    .replace(/\^([a-zA-Z0-9])/g, '$1')
}

const parseQueryString = (queryString: string): KeyValueItem[] => {
  const params: KeyValueItem[] = []
  if (!queryString) return params

  const pairs = queryString.split(/&|\^&/).filter(Boolean)

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=')
    const value = valueParts.join('=')
    if (key) {
      try {
        params.push({
          key: decodeURIComponent(key),
          value: decodeURIComponent(value || ''),
          enabled: true
        })
      } catch {
        params.push({
          key,
          value: value || '',
          enabled: true
        })
      }
    }
  }
  return params
}

export const parseCurl = (curlCommand: string): ParsedCurl => {
  try {
    let cleaned = decodeCmdEscapes(curlCommand).replace(/\s+/g, ' ').trim()

    let method = 'GET'
    const methodMatch = cleaned.match(/-X\s+["']?(\w+)["']?/i)
    if (methodMatch) {
      method = methodMatch[1].toUpperCase()
      cleaned = cleaned.replace(/-X\s+["']?\w+["']?/i, '')
    }

    const headers: KeyValueItem[] = []
    const parts = cleaned.split(/\s+/)

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-H' && i + 1 < parts.length) {
        let headerValue = parts[i + 1]

        if (headerValue.startsWith('"') && !headerValue.endsWith('"')) {
          let j = i + 2
          while (j < parts.length && !parts[j - 1].endsWith('"')) {
            headerValue += ' ' + parts[j]
            j++
          }
          i = j - 1
        }

        headerValue = headerValue.replace(/^["']|["']$/g, '')

        const colonIndex = headerValue.indexOf(':')
        if (colonIndex !== -1) {
          const key = headerValue.substring(0, colonIndex).trim()
          let value = headerValue.substring(colonIndex + 1).trim()

          value = value.replace(/\\"/g, '"').replace(/\\'/g, "'")
          value = decodeCmdEscapes(value)

          headers.push({ key, value, enabled: true })
        }
      }
    }

    cleaned = cleaned.replace(/-H\s+["'][^"']*["']/g, '').trim()

    let body = ''
    const dataIndex = cleaned.indexOf('-d ')
    if (dataIndex !== -1) {
      const afterD = cleaned.substring(dataIndex + 3).trim()
      let endIndex = afterD.length
      if (afterD.startsWith('"')) {
        const closingQuote = afterD.indexOf('"', 1)
        if (closingQuote !== -1) {
          endIndex = closingQuote + 1
        }
      } else if (afterD.startsWith("'")) {
        const closingQuote = afterD.indexOf("'", 1)
        if (closingQuote !== -1) {
          endIndex = closingQuote + 1
        }
      } else {
        const spaceIndex = afterD.indexOf(' ')
        if (spaceIndex !== -1) {
          endIndex = spaceIndex
        }
      }
      body = afterD.substring(0, endIndex).replace(/^["']|["']$/g, '')

      body = decodeCmdEscapes(body)

      try {
        if (body && body.includes('=') && !body.startsWith('{') && !body.startsWith('[')) {
          body = decodeURIComponent(body)
        }
      } catch {
        // Keep original body if decoding fails
      }

      const dPart = cleaned.substring(dataIndex).split(' ')[0] + ' ' + afterD.substring(0, endIndex)
      cleaned = cleaned.replace(dPart, '')
    }

    const urlRegex = /(https?:\/\/[^"\s]+)/
    const urlMatch = urlRegex.exec(cleaned)
    let rawUrl = ''
    if (urlMatch) {
      rawUrl = urlMatch[1]
    }

    let decodedUrl = decodeCmdEscapes(rawUrl)
    decodedUrl = decodedUrl.replace(/\^$/, '')

    let params: KeyValueItem[] = []
    let url = decodedUrl
    try {
      const urlObj = new URL(decodedUrl)
      params = Array.from(urlObj.searchParams.entries()).map(([key, value]) => {
        try {
          return {
            key,
            value: decodeURIComponent(value),
            enabled: true
          }
        } catch {
          return {
            key,
            value,
            enabled: true
          }
        }
      })
      url = urlObj.origin + urlObj.pathname
    } catch {
      const queryIndex = decodedUrl.indexOf('?')
      if (queryIndex !== -1) {
        url = decodedUrl.substring(0, queryIndex)
        const queryString = decodedUrl.substring(queryIndex + 1)
        params = parseQueryString(queryString)
      }
    }

    return {
      method,
      url,
      headers,
      params,
      body
    }
  } catch (error) {
    throw new Error(`Invalid curl command: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
