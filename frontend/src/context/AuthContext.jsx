import { useMemo, useState } from 'react'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ token: null, role: null, user: null })
  const contextValue = useMemo(() => ({ authState, setAuthState }), [authState])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
