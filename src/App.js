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
import { SnackbarProvider} from 'notistack';

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
// const { chains, provider, webSocketProvider } = configureChains([chain.polygonMumbai], [
//   publicProvider(),
// ])
const { chains, provider, webSocketProvider } = configureChains([chain.goerli], [
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
    <SnackbarProvider maxSnack={3}>
      <WagmiConfig client={client}>
        <Home />
      </WagmiConfig>
    </SnackbarProvider>
    </>
  );
}

export default App;
