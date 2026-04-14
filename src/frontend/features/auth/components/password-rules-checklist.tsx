import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { Box, Stack, Typography } from "@mui/material"

import { getPasswordRulesStatus } from "@/modules/auth/schemas/sign-up.schema"

type PasswordRulesChecklistProps = {
  password: string
}

export function PasswordRulesChecklist({ password }: PasswordRulesChecklistProps) {
  const statuses = getPasswordRulesStatus(password)

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        backgroundColor: "rgba(0,0,0,0.01)"
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 1 }}>
        Regras da senha
      </Typography>

      <Stack spacing={0.5}>
        {statuses.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: item.met ? "success.main" : "text.secondary"
            }}
          >
            {item.met ? (
              <CheckCircleIcon fontSize="small" />
            ) : (
              <CancelIcon fontSize="small" />
            )}
            <Typography variant="caption">{item.label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
