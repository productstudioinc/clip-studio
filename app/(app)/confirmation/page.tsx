import { getUser } from '@/actions/auth/user'

import ConfirmationDialog from '@/components/confirmation-dialog'

export default async function Page() {
  const { user } = await getUser()
  return <ConfirmationDialog user={user} />
}
