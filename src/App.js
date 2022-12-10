import * as React from 'react';
import {Home} from './Components/Home'
import {
  chain,
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, provider, webSocketProvider } = configureChains([chain.polygonMumbai], [
  publicProvider(),
])
// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains })
    
  ],
  provider,
  webSocketProvider,
})


function App() {
  return (
    <>
      <WagmiConfig client={client}>
        <Home />
      </WagmiConfig>
      
    </>
  );
}

export default App;
