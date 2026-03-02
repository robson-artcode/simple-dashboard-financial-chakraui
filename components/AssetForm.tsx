"use client";

import {
  Box,
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  FormControl,
  FormLabel,
  HStack as ChakraHStack,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import type { Asset } from "@/lib/types";
import { defaultAssetColor, normalizeHexColor } from "@/lib/color";

const BRL_PROPS = {
  prefix: "R$ ",
  decimalSeparator: ",",
  groupSeparator: ".",
  decimalsLimit: 2,
  allowDecimals: true,
} as const;

/** Formata número para exibição em Real (BRL): R$ 1.234,56 */
function formatBRL(value: number): string {
  if (Number.isNaN(value) || value < 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const currencyInputStyles = {
  bg: "gray.700",
  borderColor: "green.600",
  borderWidth: "1px",
  borderRadius: "md",
  _focus: {
    borderColor: "teal.400",
    boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)",
  },
  _focusVisible: {
    outline: "none",
  },
  w: "140px",
};

type AssetFormProps = {
  assets: Asset[];
  mounted: boolean;
  onAdd: (name: string, value: number) => void;
  onUpdate: (id: string, name: string, value: number) => void;
  onColorChange: (id: string, color: string) => void;
  onRemove: (id: string) => void;
};

export function AssetForm({ assets, mounted, onAdd, onUpdate, onColorChange, onRemove }: AssetFormProps) {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState<number | undefined>(undefined);
  const [newValueInputKey, setNewValueInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState<number>(0);
  const [colorDraftById, setColorDraftById] = useState<Record<string, string>>({});
  const toast = useToast();

  const handleAdd = () => {
    const name = newName.trim();
    const value = newValue ?? 0;
    if (!name) {
      toast({ title: "Informe o nome do ativo", status: "warning", isClosable: true });
      return;
    }
    if (value <= 0) {
      toast({ title: "Informe um valor válido", status: "warning", isClosable: true });
      return;
    }
    onAdd(name, value);
    setNewName("");
    setNewValue(undefined);
    setNewValueInputKey((k) => k + 1);
  };

  const startEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
    setEditValue(asset.value);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name || editValue < 0) {
      toast({ title: "Nome e valor devem ser válidos", status: "warning", isClosable: true });
      return;
    }
    onUpdate(editingId, name, editValue);
    setEditingId(null);
  };

  if (!mounted) {
    return (
      <Box p={6} bg="gray.800" borderRadius="xl" h="full">
        <VStack align="stretch" spacing={4}>
          <Box h="10" bg="gray.700" borderRadius="md" />
          <Box h="10" bg="gray.700" borderRadius="md" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} bg="gray.800" borderRadius="xl" h="full" overflow="auto">
      <VStack align="stretch" spacing={4}>
        {assets.map((asset) => (
          <HStack key={asset.id} align="flex-end" gap={2} flexWrap="wrap">
            <Input
              placeholder="Nome do ativo"
              value={editingId === asset.id ? editName : asset.name}
              onChange={(e) =>
                editingId === asset.id ? setEditName(e.target.value) : undefined
              }
              isReadOnly={editingId !== asset.id}
              bg="gray.700"
              borderColor="gray.600"
              _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px var(--chakra-colors-teal-400)" }}
              flex="1"
              minW="120px"
            />
            {editingId === asset.id ? (
              <CurrencyInput
                key={editingId}
                defaultValue={asset.value}
                onValueChange={(_v, _n, values) =>
                  setEditValue(values?.float ?? 0)
                }
                placeholder="R$ 0,00"
                customInput={Input}
                {...BRL_PROPS}
                {...currencyInputStyles}
              />
            ) : (
              <Input
                value={formatBRL(asset.value)}
                isReadOnly
                bg="gray.700"
                borderColor="green.600"
                w="140px"
              />
            )}

            <Popover
              placement="bottom-start"
              onOpen={() => {
                const current = asset.color ?? defaultAssetColor(asset.id);
                setColorDraftById((prev) => ({ ...prev, [asset.id]: current }));
              }}
            >
              <PopoverTrigger>
                <Box
                  as="button"
                  type="button"
                  aria-label={`Selecionar cor de ${asset.name}`}
                  w="34px"
                  h="34px"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.600"
                  bg={asset.color ?? defaultAssetColor(asset.id)}
                  _hover={{ borderColor: "teal.400" }}
                  _focusVisible={{ outline: "2px solid", outlineColor: "teal.400" }}
                />
              </PopoverTrigger>
              <PopoverContent bg="gray.800" borderColor="gray.600" w="260px">
                <PopoverArrow bg="gray.800" />
                <PopoverCloseButton color="gray.200" />
                <PopoverBody pt={8}>
                  <FormControl>
                    <FormLabel color="gray.200" fontSize="sm" mb={2}>
                      Cor (hex)
                    </FormLabel>
                    <ChakraHStack gap={2} align="center">
                      <Input
                        type="color"
                        value={normalizeHexColor(colorDraftById[asset.id] ?? asset.color ?? defaultAssetColor(asset.id)) ?? "#000000"}
                        onChange={(e) => {
                          const next = e.target.value.toUpperCase();
                          setColorDraftById((prev) => ({ ...prev, [asset.id]: next }));
                          onColorChange(asset.id, next);
                        }}
                        p={1}
                        w="52px"
                        h="40px"
                        bg="gray.700"
                        borderColor="gray.600"
                      />
                      <Input
                        value={colorDraftById[asset.id] ?? asset.color ?? defaultAssetColor(asset.id)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setColorDraftById((prev) => ({ ...prev, [asset.id]: next }));
                          const normalized = normalizeHexColor(next);
                          if (normalized) onColorChange(asset.id, normalized);
                        }}
                        onBlur={() => {
                          const cur = colorDraftById[asset.id] ?? "";
                          const normalized = normalizeHexColor(cur);
                          if (normalized) {
                            setColorDraftById((prev) => ({ ...prev, [asset.id]: normalized }));
                            onColorChange(asset.id, normalized);
                          }
                        }}
                        placeholder="#A1B2C3"
                        bg="gray.700"
                        borderColor="gray.600"
                        _focus={{ borderColor: "teal.400" }}
                      />
                    </ChakraHStack>
                  </FormControl>
                </PopoverBody>
              </PopoverContent>
            </Popover>

            <Button
              size="md"
              colorScheme="blue"
              onClick={editingId === asset.id ? saveEdit : () => startEdit(asset)}
            >
              {editingId === asset.id ? "Salvar" : "Editar"}
            </Button>
            <Button
              size="md"
              colorScheme="red"
              variant="outline"
              onClick={() => onRemove(asset.id)}
            >
              Remover
            </Button>
          </HStack>
        ))}

        <Box pt={4} borderTopWidth="1px" borderColor="gray.600">
          <VStack align="stretch" spacing={3}>
            <HStack align="flex-end" gap={2}>
              <Input
                placeholder="Nome do novo ativo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                bg="gray.700"
                borderColor="gray.600"
                _focus={{ borderColor: "teal.400" }}
                flex="1"
              />
              <CurrencyInput
                key={`new-value-${newValueInputKey}`}
                onValueChange={(_v, _n, values) =>
                  setNewValue(values?.float ?? undefined)
                }
                placeholder="R$ 0,00"
                customInput={Input}
                {...BRL_PROPS}
                {...currencyInputStyles}
              />
            </HStack>
            <Button
              w="full"
              colorScheme="teal"
              onClick={handleAdd}
            >
              Novo ativo
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
