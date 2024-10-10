import React from 'react'
import { VideoProps } from '@/stores/templatestore'
import { UseFormReturn } from 'react-hook-form'

type FormErrorsProps = {
  form: UseFormReturn<VideoProps>
}
export const FormErrors: React.FC<FormErrorsProps> = ({ form }) => (
  <>
    {Object.entries(form.formState.errors).map(([key, error]) => (
      <div key={key} className="text-red-500 mb-4">
        Error: {error.message}
      </div>
    ))}
  </>
)
