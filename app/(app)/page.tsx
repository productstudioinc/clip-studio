import { getAppData } from '@/actions/get-app-data'

import { AppProvider } from '@/components/app-provider'
import { RootForm } from '@/components/forms/root-form'
import { LoginDrawer } from '@/components/login-drawer'

export default async function Page() {
  const initialData = await getAppData()
  return (
    <AppProvider initialData={initialData}>
      <div className="w-full max-w-7xl mx-auto space-y-4">
        <RootForm />
      </div>
      <LoginDrawer />
    </AppProvider>
  )
}
