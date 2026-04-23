// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract NFTMinting is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Address for address payable;

    error MaxSupplyMustBeGreaterThanZero();
    error MaxSupplyReached();
    error IncorrectMintPrice();
    error EmptyBaseURI();
    error MintPriceMustBeGreaterThanZero();
    error NoETHToWithdraw();

    uint256 public immutable maxSupply;
    uint256 public mintPrice;

    uint256 private _totalMinted;
    string private _baseTokenURI;

    event Minted(address indexed user, uint256 tokenId);
    event Withdraw(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event MintPriceUpdated(uint256 newMintPrice);

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

    function mint() external payable whenNotPaused returns (uint256 tokenId) {
        if (_totalMinted >= maxSupply) revert MaxSupplyReached();
        if (msg.value != mintPrice) revert IncorrectMintPrice();

        tokenId = _totalMinted + 1;
        _totalMinted = tokenId;

        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        if (bytes(newBaseURI).length == 0) revert EmptyBaseURI();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setMintPrice(uint256 newMintPrice) external onlyOwner {
        if (newMintPrice == 0) revert MintPriceMustBeGreaterThanZero();
        mintPrice = newMintPrice;
        emit MintPriceUpdated(newMintPrice);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoETHToWithdraw();
        address recipient = owner();
        payable(recipient).sendValue(balance);

        emit Withdraw(recipient, balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}