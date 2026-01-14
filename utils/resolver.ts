interface Variable {
  key: string
  value: string
}

interface KeyValueItem {
  key: string
  value: string
  enabled: boolean
}

interface Request {
  method: string
  url: string
  params: KeyValueItem[]
  headers: KeyValueItem[]
  body: string
  bodyType: string
}

interface ActiveEnv {
  variables: Variable[]
}

interface PreparedRequest {
  method: string
  url: string
  params: Record<string, string>
  headers: Record<string, string>
  data: unknown
}

export const resolveVariables = (str: string, variables: Variable[]): string => {
  if (typeof str !== "string") return str

  return str.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim()
    const variable = variables.find((v) => v.key === trimmedKey)
    return variable ? variable.value : match
  })
}

export const prepareRequest = (request: Request, activeEnv: ActiveEnv | undefined): PreparedRequest => {
  const variables = activeEnv?.variables || []

  const resolve = (val: string) => resolveVariables(val, variables)

  const resolvedUrl = resolve(request.url)

  const headers: Record<string, string> = {}
  request.headers.forEach((h) => {
    if (h.enabled && h.key) {
      headers[resolve(h.key)] = resolve(h.value)
    }
  })

  const params: Record<string, string> = {}
  request.params.forEach((p) => {
    if (p.enabled && p.key) {
      params[resolve(p.key)] = resolve(p.value)
    }
  })

  let data: unknown = request.body
  if (request.bodyType === "json" && request.body) {
    try {
      const resolvedBody = resolveVariables(request.body, variables)
      data = JSON.parse(resolvedBody)
    } catch {
      // If JSON parse fails, send as is
    }
  }

  return {
    method: request.method,
    url: resolvedUrl,
    params,
    headers,
    data,
  }
}
