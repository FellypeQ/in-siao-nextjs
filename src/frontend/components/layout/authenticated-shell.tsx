"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import { Permission, type PermissionKey } from "@/shared/constants/permissions";
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
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthenticatedShellProps = {
  user: {
    nome: string;
    email: string;
    role: "ADMIN" | "STAFF";
    permissions?: string[];
  };
  children: React.ReactNode;
};

const drawerWidth = 240;

export function AuthenticatedShell({
  user,
  children,
}: AuthenticatedShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function hasPermission(permission: PermissionKey): boolean {
    if (user.role === "ADMIN") {
      return true;
    }

    return user.permissions?.includes(permission) ?? false;
  }

  const canOpenVisitantesModule =
    user.role === "ADMIN" ||
    hasPermission(Permission.VISITANTES_LISTAR) ||
    hasPermission(Permission.VISITANTES_CADASTRAR) ||
    hasPermission(Permission.VISITANTES_EDITAR) ||
    hasPermission(Permission.VISITANTES_EXCLUIR) ||
    hasPermission(Permission.VISITANTES_EXPORTAR);

  const drawerContent = (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 1 }}>
        Navegacao
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        {canOpenVisitantesModule && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/visitantes"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <GroupAddIcon />
              </ListItemIcon>
              <ListItemText primary="Visitantes" />
            </ListItemButton>
          </ListItem>
        )}
        {user.role === "ADMIN" && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/admin/usuarios"
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f7f3" }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
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

          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="/images/logo-siao-branco-sem-fundo.png"
              alt="Sião"
              sx={{ height: 36, ml: -5 }}
            />
          </Link>

          <Box sx={{ ml: "auto" }}>
            <Button
              color="inherit"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              startIcon={
                <Avatar sx={{ width: 28, height: 28 }}>
                  {user.nome.charAt(0).toUpperCase()}
                </Avatar>
              }
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
                component={Link}
                href="/perfil"
                onClick={() => setMenuAnchor(null)}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Meu Perfil
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  void handleLogout();
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

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
