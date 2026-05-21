// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title NFTMinting
 * @notice ERC721 token contract with rarity tiers (Common, Rare, Legendary), tiered pricing,
 *         wallet mint limits, owner-controlled base URI, pausability, and owner-only withdrawals.
 * @dev Uses OpenZeppelin upgrade-safe building blocks patterns (Ownable, Pausable, ReentrancyGuard)
 *      and relies on `ERC721`'s base URI mechanism via overriding `_baseURI()`.
 */
contract NFTMinting is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Address for address payable;

    /// @dev Rarity tiers for NFTs
    enum Rarity { Common, Rare, Legendary }

    /// @dev Reverts when `maxSupply_` is set to zero.
    error MaxSupplyMustBeGreaterThanZero();

    /// @dev Reverts once the maximum supply has been reached.
    error MaxSupplyReached();

    /// @dev Reverts when the caller provides an ETH value different from the tier price.
    error IncorrectMintPrice();

    /// @dev Reverts when an empty base URI is provided.
    error EmptyBaseURI();

    /// @dev Reverts when mint price is set to zero.
    error MintPriceMustBeGreaterThanZero();

    /// @dev Reverts when attempting to withdraw while the contract holds no ETH.
    error NoETHToWithdraw();

    /// @dev Reverts when wallet mint limit is exceeded for a tier.
    error WalletLimitExceeded();

    /// @dev Reverts when an empty name is provided.
    error EmptyName();

    /// @dev Reverts when an empty symbol is provided.
    error EmptySymbol();

    /// @notice The maximum number of tokens that can ever be minted.
    uint256 public immutable maxSupply;

    /// @notice Mint prices per rarity tier (in wei).
    mapping(Rarity => uint256) public mintPrices;

    /// @notice Wallet mint limits per rarity tier.
    mapping(Rarity => uint256) public walletLimits;

    /// @dev Tracks minted count per wallet per tier.
    mapping(address => mapping(Rarity => uint256)) private _walletMintCounts;

    /// @dev Tracks the current total number of minted tokens.
    uint256 private _totalMinted;

    /// @dev Stores rarity for each token ID.
    mapping(uint256 => Rarity) private _tokenRarity;

    /// @dev Stored base URI used by `ERC721.tokenURI()` (via `_baseURI()` override).
    string private _baseTokenURI;

    /// @notice Emitted when a new token is minted.
    /// @param user The address that minted the token.
    /// @param tokenId The newly minted token id.
    event Minted(address indexed user, uint256 tokenId);

    /// @notice Emitted when the contract owner withdraws collected ETH.
    /// @param owner The owner address receiving the ETH.
    /// @param amount The withdrawn amount (in wei).
    event Withdraw(address indexed owner, uint256 amount);

    /// @notice Emitted when the base URI is updated.
    /// @param newBaseURI The new base URI.
    event BaseURIUpdated(string newBaseURI);

    /// @notice Emitted when mint prices are updated for a tier.
    /// @param tier The rarity tier.
    /// @param newPrice The new mint price (in wei).
    event MintPriceUpdated(Rarity tier, uint256 newPrice);

    /// @notice Emitted when wallet limits are updated for a tier.
    /// @param tier The rarity tier.
    /// @param newLimit The new wallet limit.
    event WalletLimitUpdated(Rarity tier, uint256 newLimit);

    /// @notice Emitted when a token is minted with rarity.
    /// @param user The address that minted the token.
    /// @param tokenId The newly minted token id.
    /// @param tier The rarity tier of the token.
    event MintedWithRarity(address indexed user, uint256 tokenId, Rarity tier);

    /**
     * @notice Creates the collection with an initial configuration.
     * @param name_ ERC721 name.
     * @param symbol_ ERC721 symbol.
     * @param maxSupply_ Maximum number of tokens that can be minted (must be > 0).
     * @dev Uses hardcoded Pinata folder base URI for images and default pricing/limits.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_
    ) ERC721(name_, symbol_) Ownable(msg.sender) Pausable() ReentrancyGuard() {
        if (bytes(name_).length == 0) revert EmptyName();
        if (bytes(symbol_).length == 0) revert EmptySymbol();
        if (maxSupply_ == 0) revert MaxSupplyMustBeGreaterThanZero();

        // Set Pinata folder base URI
        _baseTokenURI = "https://gateway.pinata.cloud/ipfs/bafybeicm7ebe23oj3kqod272ta3ksloyyk5v2byjrlcgc6gxq27mvpoxgm/";
        maxSupply = maxSupply_;

        // Set default mint prices
        mintPrices[Rarity.Common] = 100000000000000 wei; // 0.0001 ETH
        mintPrices[Rarity.Rare] = 500000000000000 wei; // 0.0005 ETH
        mintPrices[Rarity.Legendary] = 2000000000000000 wei; // 0.002 ETH

        // Set default wallet limits
        walletLimits[Rarity.Common] = 5;
        walletLimits[Rarity.Rare] = 3;
        walletLimits[Rarity.Legendary] = 1;
    }

    /**
     * @notice Mints a new token of specified rarity to the caller.
     * @dev Requires the contract to be unpaused, enforces exact price match, and wallet limit.
     *      Token ids start at 1 and increase sequentially.
     * @param tier The rarity tier to mint.
     * @return tokenId The token id that was minted.
     */
    function mint(Rarity tier) external payable whenNotPaused returns (uint256 tokenId) {
        if (_totalMinted >= maxSupply) revert MaxSupplyReached();
        if (msg.value != mintPrices[tier]) revert IncorrectMintPrice();
        if (_walletMintCounts[msg.sender][tier] >= walletLimits[tier]) revert WalletLimitExceeded();

        // Derive the next token id from the current total minted.
        tokenId = _totalMinted + 1;
        _totalMinted = tokenId;
        _tokenRarity[tokenId] = tier;
        _walletMintCounts[msg.sender][tier]++;

        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
        emit MintedWithRarity(msg.sender, tokenId, tier);
    }

    /**
     * @notice Returns the number of tokens minted so far.
     * @dev This is not necessarily equal to `maxSupply` until the collection is fully minted.
     */
    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    /**
     * @notice Returns the token URI for a given token id.
     * @dev Returns on-chain metadata JSON with image URL from public folder based on rarity tier.
     * @param tokenId The token id to query.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert ERC721NonexistentToken(tokenId);
        
        Rarity tier = _tokenRarity[tokenId];
        string memory imageName;
        
        // Map rarity tiers to image filenames
        // Order: robot_cat5-1, then cut_cat5-1
        // Legendary: robot_cat5, cut_cat5
        // Rare: robot_cat4, robot_cat3, cut_cat4, cut_cat3
        // Common: robot_cat2, robot_cat1, cut_cat2, cut_cat1
        
        if (tier == Rarity.Common) {
            // Common: robot_cat2, robot_cat1, cut_cat2, cut_cat1
            uint256 imageIndex = tokenId % 4;
            if (imageIndex == 0) {
                imageName = "robot_cat2.png";
            } else if (imageIndex == 1) {
                imageName = "robot_cat1.png";
            } else if (imageIndex == 2) {
                imageName = "cut_cat2.png";
            } else {
                imageName = "cut_cat1.png";
            }
        } else if (tier == Rarity.Rare) {
            // Rare: robot_cat4, robot_cat3, cut_cat4, cut_cat3
            uint256 imageIndex = tokenId % 4;
            if (imageIndex == 0) {
                imageName = "robot_cat4.png";
            } else if (imageIndex == 1) {
                imageName = "robot_cat3.png";
            } else if (imageIndex == 2) {
                imageName = "cut_cat4.png";
            } else {
                imageName = "cut_cat3.png";
            }
        } else if (tier == Rarity.Legendary) {
            // Legendary: robot_cat5, cut_cat5
            uint256 imageIndex = tokenId % 2;
            if (imageIndex == 0) {
                imageName = "robot_cat5.png";
            } else {
                imageName = "cut_cat5.png";
            }
        }
        
        // Construct image URL using base URI + filename
        string memory imageUrl = string(abi.encodePacked(_baseTokenURI, imageName));
        
        string memory metadata = string(abi.encodePacked(
            '{"name":"',
            name(),
            " #",
            toString(tokenId),
            '","description":"',
            name(),
            " NFT - ",
            _getRarityName(tier),
            ' Tier","image":"',
            imageUrl,
            '","attributes":[{"trait_type":"Rarity","value":"',
            _getRarityName(tier),
            '"}]}'
        ));
        
        // Return as base64-encoded data URI for Etherscan/MetaMask compatibility
        string memory jsonBase64 = base64Encode(bytes(metadata));
        return string(abi.encodePacked("data:application/json;base64,", jsonBase64));
    }

    /**
     * @notice Updates the base URI used for token metadata.
     * @dev Owner-only. Reverts on empty strings.
     * @param newBaseURI New base URI (e.g. `https://.../`).
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        if (bytes(newBaseURI).length == 0) revert EmptyBaseURI();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @notice Updates the mint price for a specific tier.
     * @dev Owner-only. Reverts when `newPrice` is zero.
     * @param tier The rarity tier to update.
     * @param newPrice New mint price (in wei).
     */
    function setMintPrice(Rarity tier, uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert MintPriceMustBeGreaterThanZero();
        mintPrices[tier] = newPrice;
        emit MintPriceUpdated(tier, newPrice);
    }

    /**
     * @notice Updates the wallet limit for a specific tier.
     * @dev Owner-only.
     * @param tier The rarity tier to update.
     * @param newLimit New wallet limit.
     */
    function setWalletLimit(Rarity tier, uint256 newLimit) external onlyOwner {
        walletLimits[tier] = newLimit;
        emit WalletLimitUpdated(tier, newLimit);
    }

    /**
     * @notice Returns the mint count for a wallet for a specific tier.
     * @param wallet The wallet address to query.
     * @param tier The rarity tier to query.
     * @return count The number of tokens minted by the wallet for the tier.
     */
    function getWalletMintCount(address wallet, Rarity tier) external view returns (uint256) {
        return _walletMintCounts[wallet][tier];
    }

    /**
     * @notice Returns the rarity of a token.
     * @param tokenId The token id to query.
     * @return tier The rarity tier of the token.
     */
    function getTokenRarity(uint256 tokenId) external view returns (Rarity) {
        return _tokenRarity[tokenId];
    }

    /**
     * @notice Pauses minting.
     * @dev Owner-only.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses minting.
     * @dev Owner-only.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraws all collected ETH to the contract owner.
     * @dev Owner-only and protected by `nonReentrant`. Reverts if contract holds no ETH.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoETHToWithdraw();
        address recipient = owner();
        payable(recipient).sendValue(balance);

        emit Withdraw(recipient, balance);
    }

    /**
     * @dev Returns the base URI for computing token URIs.
     *      Overridden from OpenZeppelin `ERC721` to return the value stored in `_baseTokenURI`.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Converts a uint256 to its string representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Returns the string name of a rarity tier.
     */
    function _getRarityName(Rarity tier) internal pure returns (string memory) {
        if (tier == Rarity.Common) return "Common";
        if (tier == Rarity.Rare) return "Rare";
        if (tier == Rarity.Legendary) return "Legendary";
        return "Unknown";
    }

    /**
     * @dev Base64 encode bytes for data URI
     * Based on OpenZeppelin's Base64 implementation
     */
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";

        // Calculate output length: 4 chars per 3 bytes, plus padding
        uint256 encodedLen = 4 * ((len + 2) / 3);

        bytes memory result = new bytes(encodedLen + 32);
        
        bytes memory table = bytes(TABLE);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, len) {
                
            } {
                // Read 3 bytes at a time
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)
                
                // Encode to 4 characters
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            // Handle padding
            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return string(result);
    }
}