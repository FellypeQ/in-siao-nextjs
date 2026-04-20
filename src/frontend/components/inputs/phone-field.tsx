"use client"

import { TextField } from "@mui/material"
import type { TextFieldProps } from "@mui/material"
import { formatPhone } from "@/frontend/shared/utils/format-phone"

type PhoneFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string
  onChange: (digits: string) => void
}

export function PhoneField({ value, onChange, ...props }: PhoneFieldProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11)
    onChange(digits)
  }

  return (
    <TextField
      {...props}
      value={formatPhone(value)}
      onChange={handleChange}
    />
  )
}
