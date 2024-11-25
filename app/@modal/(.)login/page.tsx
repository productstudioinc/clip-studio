import { getAppData } from '@/actions/get-app-data'

import { AppProvider } from '@/components/app-provider'

import LoginClient from './login-client'

export default async function Page() {
  const initialData = await getAppData()
  return (
    <AppProvider initialData={initialData}>
      <LoginClient />
    </AppProvider>
  )
}
