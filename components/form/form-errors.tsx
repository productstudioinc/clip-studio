import React from 'react'
import { VideoProps } from '@/stores/templatestore'
import { UseFormReturn } from 'react-hook-form'

type FormErrorsProps = {
  form: UseFormReturn<VideoProps>
}

export const FormErrors: React.FC<FormErrorsProps> = ({ form }) => (
  <>
    {form.formState.errors.root?.serverError && (
      <div className="text-red-500 mb-4">
        {form.formState.errors.root.serverError.message}
      </div>
    )}
  </>
)
