"use client"

import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from "@mui/icons-material/Home"
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type AuthenticatedShellProps = {
  user: {
    nome: string
    email: string
  }
  children: React.ReactNode
}

const drawerWidth = 240

export function AuthenticatedShell({ user, children }: AuthenticatedShellProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  async function handleLogout() {
    await fetch("/api/auth/sign-out", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const drawerContent = (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 1 }}>
        Navegacao
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/" onClick={() => setMobileOpen(false)}>
            <ListItemIcon sx={{ color: "inherit" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f7f3" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}
          >
            Siao
          </Typography>

          <Box sx={{ ml: "auto" }}>
            <Button
              color="inherit"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              startIcon={<Avatar sx={{ width: 28, height: 28 }}>{user.nome.charAt(0).toUpperCase()}</Avatar>}
            >
              {user.nome}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>{user.email}</MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null)
                  void handleLogout()
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  )
}
