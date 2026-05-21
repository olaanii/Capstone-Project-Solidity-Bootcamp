export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x640420bbBfb81Cd6B05058f0d8C57179CD03a7bC";

export const SEPOLIA_CHAIN_ID = 11155111;

export const NFT_IMAGES = {
  common: [
    "/robot_cat2.png",
    "/robot_cat1.png",
    "/cut_cat2.png",
    "/cut_cat1.png"
  ],
  rare: [
    "/robot_cat4.png",
    "/robot_cat3.png",
    "/cut_cat4.png",
    "/cut_cat3.png"
  ],
  legendary: [
    "/robot_cat5.png",
    "/cut_cat5.png"
  ]
};

export const RARITY_CONFIG = {
  common: {
    name: "Common",
    price: "0.0001",
    limit: 5,
    value: "0.001",
    color: "#c6c9ae"
  },
  rare: {
    name: "Rare",
    price: "0.0005",
    limit: 3,
    value: "0.005",
    color: "#d2f032"
  },
  legendary: {
    name: "Legendary",
    price: "0.002",
    limit: 1,
    value: "0.01",
    color: "#c3f400"
  }
};

export const RARITY_VALUES: Record<number, string> = {
  0: "0.001",
  1: "0.005",
  2: "0.01"
};
