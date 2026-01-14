import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, method, headers, data } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const fetchHeaders: HeadersInit = {}
    if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        if (key && value) {
          fetchHeaders[key] = String(value)
        }
      })
    }

    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: fetchHeaders,
    }

    if (data && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof data === 'string' ? data : JSON.stringify(data)
    }

    const startTime = Date.now()
    const response = await fetch(url, fetchOptions)
    const endTime = Date.now()

    const responseText = await response.text()
    let responseData: unknown
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return NextResponse.json({
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      time: endTime - startTime,
      size: responseText.length,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: true,
        data: errorMessage,
        status: 'Error',
        statusText: 'Network Error',
        headers: {},
        time: 0,
        size: 0,
      },
      { status: 500 }
    )
  }
}
