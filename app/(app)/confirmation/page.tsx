import { revalidatePath } from 'next/cache'
import { getUser } from '@/actions/auth/user'

import ConfirmationDialog from '@/components/confirmation-dialog'

export default async function Page() {
  const { user } = await getUser()
  revalidatePath('/')
  return <ConfirmationDialog user={user} />
}
