import React, { useState } from 'react';
import { AptosClient } from 'aptos';
import { Network, Unplug, Copy, CheckCircle } from 'lucide-react';

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com';
//const FAUCET_URL = 'https://faucet.devnet.aptoslabs.com';

const aptosClient = new AptosClient(NODE_URL);
//const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

declare global {
  interface Window {
    aptos?: any;
  }
}

const ConnectWallet: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        alert('Petra Wallet is not installed!');
        return;
      }

      const response = await window.aptos.connect();
      const address = response.address;

      setWalletAddress(address);
      await getBalance(address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
        setWalletAddress(null);
        setTokenBalance(null);
      }
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const getBalance = async (address: string) => {
    try {
      const resources = await aptosClient.getAccountResources(address);
      const coinResource = resources.find((r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
      const balance = coinResource ? (coinResource.data as any).coin.value : 0;
      setTokenBalance(balance / 1_000_000);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e2433] rounded-2xl shadow-2xl border border-[#334155] p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Network className="w-16 h-16 text-[#22d3ee] mr-4" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] tracking-tight">
            Aptos Wallet
          </h1>
        </div>
        
        {!walletAddress ? (
          <button 
            onClick={connectWallet}
            className="w-full py-3 bg-[#22d3ee] hover:bg-[#06b6d4] transition-colors duration-300 text-[#0f172a] font-bold rounded-lg shadow-lg flex items-center justify-center space-x-2 mb-6"
          >
            <Network className="w-5 h-5" />
            <span>Connect to Aptos Wallet</span>
          </button>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={disconnectWallet}
              className="w-full py-3 bg-[#ef4444] hover:bg-[#dc2626] transition-colors duration-300 text-white font-bold rounded-lg shadow-lg flex items-center justify-center space-x-2 mb-6"
            >
              <Unplug className="w-5 h-5" />
              <span>Disconnect Wallet</span>
            </button>

            <div className="bg-[#334155] rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94a3b8] mb-1">Wallet Address</p>
                  <p className="text-white font-mono truncate mr-2">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
                <button 
                  onClick={copyWalletAddress}
                  className="text-[#22d3ee] hover:text-[#06b6d4] transition-colors duration-300"
                  title="Copy Wallet Address"
                >
                  {copied ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </button>
              </div>
              
              <div>
                <p className="text-sm text-[#94a3b8] mb-1">Token Balance</p>
                <p className="text-2xl font-bold text-[#22d3ee]">
                  {tokenBalance?.toFixed(4)} APT
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;