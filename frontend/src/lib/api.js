import { useAuthStore } from '../store/useAuthStore'

const BASE_URL = 'http://localhost:9080'

async function request(method, path, body) {
  const { user } = useAuthStore.getState()

  const headers = { 'Content-Type': 'application/json' }

  if (user?.id != null) headers['userId'] = String(user.id)
  if (user?.role)       headers['role']   = user.role

  const config = { method, headers }
  if (body !== undefined) config.body = JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${path}`, config)

  const contentType = response.headers.get('content-type')
  const data = contentType?.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const get  = (path)       => request('GET',    path)
export const post = (path, body) => request('POST',   path, body)
export const put  = (path, body) => request('PUT',    path, body)
export const del  = (path)       => request('DELETE', path)
