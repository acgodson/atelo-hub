export const CHAIN_ID = 97 as const;

export const PINNED_RPC_URL = "https://bsc-testnet-dataseed.bnbchain.org";

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : undefined;
}

export function rpcUrl(): string {
  const override = readEnv("EXPO_PUBLIC_BSC_TESTNET_RPC_URL") ?? readEnv("NEXT_PUBLIC_BSC_TESTNET_RPC_URL");
  return override && override.length > 0 ? override : PINNED_RPC_URL;
}

export const bscTestnet = {
  id: CHAIN_ID,
  name: "BSC Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: { default: { http: [PINNED_RPC_URL] } },
  blockExplorers: { default: { name: "BscScan Testnet", url: "https://testnet.bscscan.com" } },
  testnet: true
} as const;

export const ADDRESSES = {
  agenticCommerce: "0xa206c0517B6371C6638CD9e4a42Cc9f02A33B0DE",
  uToken: "0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565",
  policy: "0xd6a4217588F6B1F5657a92A3e94E6422aD771cEA",
  swapRouter: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
  wbnb: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  usdt: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c"
} as const satisfies Record<string, `0x${string}`>;

export const U_TOKEN = { symbol: "U", decimals: 18 } as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }]
  }
] as const;

export const swapRouterAbi = [
  {
    type: "function",
    name: "exactInputSingle",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" }
        ]
      }
    ],
    outputs: [{ name: "amountOut", type: "uint256" }]
  }
] as const;

export const REOWN_PROJECT_ID =
  readEnv("EXPO_PUBLIC_REOWN_PROJECT_ID") ?? readEnv("NEXT_PUBLIC_REOWN_PROJECT_ID") ?? "";

export const WALLET_ENABLED = REOWN_PROJECT_ID.length > 0;

export function bscScanAddress(address: string): string {
  return `https://testnet.bscscan.com/address/${address}`;
}
