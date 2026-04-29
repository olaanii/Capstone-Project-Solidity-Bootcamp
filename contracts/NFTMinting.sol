// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title NFTMinting
 * @notice ERC721 token contract with a fixed maximum supply, configurable mint price,
 *         owner-controlled base URI, pausability, and owner-only withdrawals of collected ETH.
 * @dev Uses OpenZeppelin upgrade-safe building blocks patterns (Ownable, Pausable, ReentrancyGuard)
 *      and relies on `ERC721`'s base URI mechanism via overriding `_baseURI()`.
 */
contract NFTMinting is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Address for address payable;

    /// @dev Reverts when `maxSupply_` is set to zero.
    error MaxSupplyMustBeGreaterThanZero();

    /// @dev Reverts once the maximum supply has been reached.
    error MaxSupplyReached();

    /// @dev Reverts when the caller provides an ETH value different from `mintPrice`.
    error IncorrectMintPrice();

    /// @dev Reverts when an empty base URI is provided.
    error EmptyBaseURI();

    /// @dev Reverts when the initial or updated `mintPrice` is set to zero.
    error MintPriceMustBeGreaterThanZero();

    /// @dev Reverts when attempting to withdraw while the contract holds no ETH.
    error NoETHToWithdraw();

    /// @notice The maximum number of tokens that can ever be minted.
    uint256 public immutable maxSupply;

    /// @notice Required ETH amount to mint a token.
    uint256 public mintPrice;

    /// @dev Tracks the current total number of minted tokens (and the next tokenId derivation).
    uint256 private _totalMinted;

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

    /// @notice Emitted when the mint price is updated.
    /// @param newMintPrice The new mint price (in wei).
    event MintPriceUpdated(uint256 newMintPrice);

    /**
     * @notice Creates the collection with an initial configuration.
     * @param name_ ERC721 name.
     * @param symbol_ ERC721 symbol.
     * @param baseURI_ Base URI for token metadata (e.g. `https://.../`).
     * @param maxSupply_ Maximum number of tokens that can be minted (must be > 0).
     * @param mintPrice_ Required ETH for each mint (must be > 0).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        if (maxSupply_ == 0) revert MaxSupplyMustBeGreaterThanZero();
        if (bytes(baseURI_).length == 0) revert EmptyBaseURI();
        if (mintPrice_ == 0) revert MintPriceMustBeGreaterThanZero();

        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
    }

    /**
     * @notice Mints a new token to the caller.
     * @dev Requires the contract to be unpaused and enforces an exact `msg.value` match to `mintPrice`.
     *      Token ids start at 1 and increase sequentially.
     * @return tokenId The token id that was minted.
     */
    function mint() external payable whenNotPaused returns (uint256 tokenId) {
        if (_totalMinted >= maxSupply) revert MaxSupplyReached();
        if (msg.value != mintPrice) revert IncorrectMintPrice();

        // Derive the next token id from the current total minted.
        tokenId = _totalMinted + 1;
        _totalMinted = tokenId;

        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
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
     * @dev Delegates to OpenZeppelin's `ERC721.tokenURI()` which uses `_baseURI()` and `tokenId`.
     * @param tokenId The token id to query.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
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
     * @notice Updates the mint price.
     * @dev Owner-only. Reverts when `newMintPrice` is zero.
     * @param newMintPrice New mint price (in wei).
     */
    function setMintPrice(uint256 newMintPrice) external onlyOwner {
        if (newMintPrice == 0) revert MintPriceMustBeGreaterThanZero();
        mintPrice = newMintPrice;
        emit MintPriceUpdated(newMintPrice);
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
}