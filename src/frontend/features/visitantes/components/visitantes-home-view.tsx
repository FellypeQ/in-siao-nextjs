"use client";

import { useEffect, useState } from "react";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ListIcon from "@mui/icons-material/List";
import MessageIcon from "@mui/icons-material/Message";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import Link from "next/link";

type ChartPoint = { date: string; count: number };

type VisitantesHomeViewProps = {
  permissions: string[];
  role: "ADMIN" | "STAFF" | "MASTER";
};

const OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3

function buildDateRange(): string[] {
  const localNowMs = Date.now() - OFFSET_MS;
  const todayLocalStr = new Date(localNowMs).toISOString().slice(0, 10);
  const todayMs = new Date(todayLocalStr + "T00:00:00Z").getTime();

  const dates: string[] = [];
  for (let i = 59; i >= 0; i--) {
    dates.push(new Date(todayMs - i * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

export function VisitantesHomeView({
  permissions,
  role,
}: VisitantesHomeViewProps) {
  const isAdmin = role === "ADMIN";
  const isMaster = role === "MASTER";
  const canCadastrar =
    isAdmin || isMaster || permissions.includes("VISITANTES_CADASTRAR");
  const canListar =
    isAdmin || isMaster || permissions.includes("VISITANTES_LISTAR");
  const canMensagens =
    isAdmin ||
    isMaster ||
    permissions.includes("MENSAGENS_GERENCIAR") ||
    permissions.includes("MENSAGENS_ENVIAR");

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/visitantes/chart");
        const json = (await res.json()) as ChartPoint[];
        setChartData(Array.isArray(json) ? json : []);
      } finally {
        setChartLoading(false);
      }
    }
    void load();
  }, []);

  const dates = buildDateRange();
  const countMap = new Map(chartData.map((p) => [p.date, p.count]));
  const yData = dates.map((d) => countMap.get(d) ?? 0);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {canCadastrar && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Link
              href="/visitantes/novo"
              style={{
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}
            >
              <Card sx={{ height: "100%" }}>
                <CardActionArea sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <GroupAddIcon
                      sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Cadastrar Visitante
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Registrar um novo visitante
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        )}

        {canListar && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Link
              href="/visitantes/listagem"
              style={{
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}
            >
              <Card sx={{ height: "100%" }}>
                <CardActionArea sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <ListIcon
                      sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Listar Visitantes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ver todos os visitantes cadastrados
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        )}

        {canMensagens && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Link
              href="/mensagens"
              style={{
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}
            >
              <Card sx={{ height: "100%" }}>
                <CardActionArea sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <MessageIcon
                      sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Mensagens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gerenciar fluxo de envio para visitantes
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Cadastros nos últimos 60 dias
          </Typography>
          {chartLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <LineChart
              xAxis={[
                {
                  data: dates,
                  scaleType: "point",
                  valueFormatter: (date: string) => dayjs(date).format("DD/MM"),
                  tickNumber: 8,
                },
              ]}
              series={[
                {
                  data: yData,
                  label: "Visitantes cadastrados",
                  showMark: false,
                },
              ]}
              height={280}
              sx={{ width: "100%" }}
            />
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
