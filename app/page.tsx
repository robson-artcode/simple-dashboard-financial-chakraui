"use client";

import { Box, Container, Heading, Grid } from "@chakra-ui/react";
import { AssetForm } from "@/components/AssetForm";
import { AssetPieChart } from "@/components/AssetPieChart";
import { useAssets } from "@/lib/useAssets";

export default function DashboardPage() {
  const { assets, add, update, updateColor, remove, mounted } = useAssets();

  return (
    <Box minH="100vh" bg="gray.900" py={8}>
      <Container maxW="7xl">
        <Heading size="lg" mb={8} color="white">
          Dashboard Financeiro
        </Heading>
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={8}
          alignSelf="stretch"
        >
          <Box>
            <AssetForm
              assets={assets}
              mounted={mounted}
              onAdd={add}
              onUpdate={update}
              onColorChange={updateColor}
              onRemove={remove}
            />
          </Box>
          <Box minH="400px">
            <AssetPieChart assets={assets} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
