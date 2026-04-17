"use client"

import { Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import type { TextFieldProps } from "@mui/material"
import { useState } from "react"

type PasswordFieldProps = Omit<TextFieldProps, "type">

export function PasswordField({ slotProps, ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      {...props}
      type={showPassword ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          ...(slotProps?.input as object),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
                size="small"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                sx={{ color: "text.secondary" }}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          )
        }
      }}
    />
  )
}
