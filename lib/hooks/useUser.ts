import { useEffect, useState } from 'react'
import { getUser } from '@/actions/auth/user'

type AuthUser = {
  id: string
  email?: string
  user_metadata?: Record<string, any>
} | null

export function useUser() {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
