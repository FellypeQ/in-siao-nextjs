"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

type InnerPageContentHeader = {
  title: string;
  backHref?: string;
};

type InnerPageContentProps = {
  header?: InnerPageContentHeader;
  children: ReactNode;
};

export function InnerPageContent({ header, children }: InnerPageContentProps) {
  const router = useRouter();

  function handleBack() {
    if (!header) {
      return;
    }

    const { backHref } = header;

    if (backHref) {
      router.push(backHref);
      return;
    }

    router.back();
  }

  return (
    <Box sx={{ width: "100%" }}>
      {header && (
        <AppBar
          component="header"
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            width: "100%",
            backgroundImage:
              "linear-gradient(110deg, #000000 0%, #00000098 22%, #ff5a1f 55%, #ff8f1f 85%, #ffb02e 100%)",
            color: "common.white",
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              px: { xs: 1, sm: 2 },
              py: 1,
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Button
              variant="text"
              color="inherit"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              aria-label="Voltar"
              sx={{ minWidth: 0, px: 1 }}
            ></Button>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.8rem", sm: "1.2rem" },
                }}
              >
                {header.title}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}
