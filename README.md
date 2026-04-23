# NFT Minting Smart Contract (ERC-721)

A production-ready ERC-721 NFT smart contract built with Hardhat and OpenZeppelin, aligned to the provided PRD requirements.

## Project Description

This project implements an NFT minting contract that supports:

- Public minting with ETH payment
- Fixed max supply
- Owner-managed mint price
- Base URI metadata (`baseURI + tokenId`)
- Pause/unpause emergency control
- Owner-only ETH withdrawal with reentrancy protection
- Deployment and optional Etherscan verification on Sepolia

## Tech Stack

- Solidity `^0.8.24`
- Hardhat
- OpenZeppelin Contracts (`ERC721`, `Ownable`, `Pausable`, `ReentrancyGuard`)

## Contract Address & Activity (Sepolia)

The smart contract has been successfully deployed and verified on the Sepolia test network.

- **Contract Address:** [0xF8F273671D2CeBF9d2B5cF130c5aCFF1943826d7](https://sepolia.etherscan.io/address/0xF8F273671D2CeBF9d2B5cF130c5aCFF1943826d7)
- **Recent Mint Transaction Hash:** [0x17c95bee77fe130eccf26f979539b2b1716d7f997d40af26e919b857c2348be8](https://sepolia.etherscan.io/tx/0x17c95bee77fe130eccf26f979539b2b1716d7f997d40af26e919b857c2348be8)

The contract is fully functional, with minting and other core features interacting correctly on-chain.

## Contract API

### Public Functions

- `mint()` payable
- `totalSupply()` view
- `tokenURI(uint256 tokenId)` view

### Admin Functions (onlyOwner)

- `setBaseURI(string memory)`
- `setMintPrice(uint256)`
- `pause()`
- `unpause()`
- `withdraw()`

### Events

- `Minted(address indexed user, uint256 tokenId)`
- `Withdraw(address indexed owner, uint256 amount)`
- `BaseURIUpdated(string newBaseURI)`
- `MintPriceUpdated(uint256 newMintPrice)`

## Setup

```bash
npm install
cp .env.example .env
```

Populate `.env` with your Sepolia RPC URL, deployer private key, and Etherscan API key.

## Compile

```bash
npm run compile
```

## Run Tests

```bash
npm test
```

## Deploy to Sepolia

```bash
npm run deploy:sepolia
```

## Verify Contract Manually (optional)

If automatic verification is not used in the script, run:

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS> \
  "<NFT_NAME>" "<NFT_SYMBOL>" "<BASE_URI>" <MAX_SUPPLY> <MINT_PRICE_WEI>
```

## Security Notes

- `withdraw()` is protected with `nonReentrant`
- Uses custom errors for strict input validation and lower gas on reverts
- Exact-price minting (`msg.value == mintPrice`) prevents over/underpayment
- Constructor enforces non-zero max supply, non-empty base URI, and non-zero mint price
- Admin actions are restricted by `onlyOwner`
- `pause()`/`unpause()` offers emergency stop controls
