import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

type WalletConnectButtonProps = {
  title?: string;
};

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ title }) => {
  const context = useContext(WalletContext);

  if (!context) {
    return (
      <div className='p-4 border rounded-xl bg-red-50 text-red-700'>
        WalletContext not found. Make sure to wrap App in WalletProvider.
      </div>
    );
  }

  const { account, chainId, isConnecting, isConnected, connect, disconnect, error } = context;

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className='p-4 border rounded-xl shadow-sm bg-surface glass-card flex flex-col gap-3'>
      <div className='flex justify-between items-center'>
        <h3 className='text-sm font-bold tracking-wide uppercase text-secondary'>
          {title || 'Wallet Provider'}
        </h3>
        <div className='flex items-center gap-2'>
          <span className={`dot ${isConnected ? 'dot-success dot-pulse' : 'dot-muted'}`} />
          <span className='text-xs font-semibold text-muted'>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {isConnected && account ? (
        <div className='flex flex-col gap-1 p-3 bg-elevated rounded-lg border'>
          <div className='flex justify-between text-xs text-secondary'>
            <span>Address:</span>
            <span className='mono font-semibold text-primary'>{truncateAddress(account)}</span>
          </div>
          {chainId && (
            <div className='flex justify-between text-xs text-secondary'>
              <span>Network ID:</span>
              <span className='mono font-semibold text-primary'>{chainId}</span>
            </div>
          )}
        </div>
      ) : (
        <p className='text-xs text-secondary'>
          Connect your Web3 browser wallet to interact with Digital Ownership smart contracts.
        </p>
      )}

      {error && <p className='text-xs text-danger'>{error}</p>}

      {isConnected ? (
        <button
          onClick={disconnect}
          className='w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition font-medium text-sm'
        >
          Disconnect Session
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          className='w-full py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2'
        >
          {isConnecting ? (
            <>
              <span className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      )}
    </div>
  );
};

export default WalletConnectButton;