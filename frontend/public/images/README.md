# NFT Images

These images need to be hosted publicly for MetaMask to display them correctly.

## Quick Solution: Use GitHub Pages

1. Create a new GitHub repository for the images
2. Upload all NFT images to the repository
3. Enable GitHub Pages (Settings → Pages → Select main branch)
4. Your images will be accessible at: `https://your-username.github.io/your-repo/`
5. Update the contract base URI using:
   ```bash
   npx hardhat run scripts/updateBaseURI.js --network sepolia
   ```
6. Set BASE_URI in .env to your GitHub Pages URL

## Alternative: Use Pinata (IPFS)

1. Go to https://pinata.cloud and create an account
2. Upload all NFT images to Pinata
3. Copy the IPFS gateway URL for each image
4. Update the contract base URI with the Pinata gateway URL
