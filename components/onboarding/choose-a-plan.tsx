import { CreditCalculator } from '@/components/credit-calculator-simple'
import Faq from '@/components/faq'
import Pricing from '@/components/pricing'

export function ChooseAPlan() {
  return (
    <div className="flex flex-col gap-8 p-4">
      <Pricing />
      <CreditCalculator />
      <Faq />
    </div>
  )
}
