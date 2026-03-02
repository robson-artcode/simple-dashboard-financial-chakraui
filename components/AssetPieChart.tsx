"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Asset } from "@/lib/types";
import { defaultAssetColor } from "@/lib/color";

type ChartDataItem = {
  id: string;
  name: string;
  value: number;
  percent: number;
  fill: string;
};

type AssetPieChartProps = {
  assets: Asset[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AssetPieChart({ assets }: AssetPieChartProps) {
  const total = assets.reduce((sum, a) => sum + a.value, 0);

  const data: ChartDataItem[] = assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    value: asset.value,
    percent: total > 0 ? (asset.value / total) * 100 : 0,
    fill: asset.color ?? defaultAssetColor(asset.id),
  }));

  if (assets.length === 0) {
    return (
      <Box
        bg="gray.800"
        borderRadius="xl"
        p={8}
        h="full"
        minH="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={2}>
          <Text color="gray.400" fontSize="lg">
            Nenhum ativo cadastrado
          </Text>
          <Text color="gray.500" fontSize="sm">
            Adicione ativos à esquerda para ver o gráfico
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="gray.800" borderRadius="xl" p={6} h="full" minH="400px">
      <ResponsiveContainer width="100%" height={380}>
        <RechartsPie>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            paddingAngle={2}
            isAnimationActive
            animationBegin={0}
            animationDuration={800}
            label={({ name, percent }) => `${name} (${percent.toFixed(1)}%)`}
            labelLine={{ stroke: "var(--chakra-colors-gray-400)" }}
          >
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--chakra-colors-gray-800)",
              border: "1px solid var(--chakra-colors-gray-600)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "white" }}
            formatter={(value: number, name: string, props: { payload?: ChartDataItem }) => {
              const percent = props.payload?.percent ?? 0;
              return [
                `${formatCurrency(value)} (${percent.toFixed(1)}%)`,
                name,
              ];
            }}
          />
          <Legend
            wrapperStyle={{ color: "var(--chakra-colors-gray-200)" }}
            formatter={(value) => {
              const item = data.find((d) => d.name === value);
              return item
                ? `${value} – ${formatCurrency(item.value)} (${item.percent.toFixed(1)}%)`
                : value;
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </Box>
  );
}
