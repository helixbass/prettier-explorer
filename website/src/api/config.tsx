const getApiRoot = () => process.env.REACT_APP_API_ROOT ?? ''

export const getApiEndpoint = (path: string) => `${getApiRoot()}/api/v1${path}`
