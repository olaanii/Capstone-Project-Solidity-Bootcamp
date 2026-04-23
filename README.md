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

## Contract Address (Sepolia)

Not deployed yet. After deployment, update this section with the deployed address.

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
- `BaseURIUpdated(string newBaseURI)` - Emitted when the base URI is updated
- `MintPriceUpdated(uint256 newMintPrice)` - Emitted when the mint price is updated

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