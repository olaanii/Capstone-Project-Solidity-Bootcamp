# Clerk Authentication Setup

To use Clerk for wallet authentication in this NFT minting dApp, follow these steps:

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Get these keys from your Clerk Dashboard under "API Keys".

## 3. Configure Allowed Origins

Add the following to your `next.config.js` to allow localhost development:

```javascript
module.exports = {
  // ... other config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}
```

## 4. Restart the Development Server

After adding the environment variables, restart the dev server:

```bash
npm run dev
```

## 5. Test the Integration

1. Visit http://localhost:3000
2. Click "Connect Wallet"
3. You'll be redirected to the Clerk sign-in page
4. Sign in with your preferred method (email, Google, etc.)
5. After signing in, you'll be redirected back to the mint page
6. Connect your MetaMask wallet to mint NFTs

## Contract Address

The deployed contract address is: `0x56050273Bca0e86fC8B3e289C9E1b9BD5978eece`

Add this to your environment:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x56050273Bca0e86fC8B3e289C9E1b9BD5978eece
```
