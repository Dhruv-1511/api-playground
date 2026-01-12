export const resolveVariables = (str, variables) => {
  if (typeof str !== "string") return str;

  return str.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const variable = variables.find((v) => v.key === trimmedKey);
    return variable ? variable.value : match;
  });
};

export const prepareRequest = (request, activeEnv) => {
  const variables = activeEnv?.variables || [];

  const resolve = (val) => resolveVariables(val, variables);

  const resolvedUrl = resolve(request.url);

  const headers = {};
  request.headers.forEach((h) => {
    if (h.enabled && h.key) {
      headers[resolve(h.key)] = resolve(h.value);
    }
  });

  const params = {};
  request.params.forEach((p) => {
    if (p.enabled && p.key) {
      params[resolve(p.key)] = resolve(p.value);
    }
  });

  let body = request.body;
  if (request.bodyType === "json" && body) {
    try {
      body = resolveVariables(body, variables);
      body = JSON.parse(body);
    } catch {
      // If JSON parse fails, send as is or handle error elsewhere
    }
  }

  return {
    method: request.method,
    url: resolvedUrl,
    params,
    headers,
    data: body,
  };
};
