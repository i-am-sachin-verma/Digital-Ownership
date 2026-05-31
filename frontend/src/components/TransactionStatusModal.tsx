import React, { useEffect, useMemo, useState } from 'react';

type TransactionStatusModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  status?: 'success' | 'pending' | 'error';
};

const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({ title, isOpen, onClose, txHash, status = 'pending' }) => {
  const [loading, setLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div className='w-full max-w-md glass-card p-6 flex flex-col gap-4 animate-scale-in'>
        <div className='flex justify-between items-center border-b pb-2'>
          <h2 id='modal-title' className='text-lg font-bold text-primary'>
            {title || 'Transaction Details'}
          </h2>
          <button
            onClick={onClose}
            aria-label='Close dialog'
            className='p-1 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition focus-visible:ring-2 focus-visible:ring-accent focus:outline-none'
          >
            &#x2715;
          </button>
        </div>

        <div className='space-y-4 my-2 text-sm'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-secondary font-semibold uppercase tracking-wider'>Status</span>
            <div className='flex items-center gap-2 mt-1'>
              <span className={`dot ${status === 'success' ? 'dot-success' : status === 'error' ? 'dot-danger' : 'dot-warning'}`} />
              <span className='font-semibold capitalize text-primary'>{status}</span>
            </div>
          </div>

          {txHash && (
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-secondary font-semibold uppercase tracking-wider'>Transaction Hash</span>
              <span className='mono bg-elevated px-2 py-1 rounded text-accent select-all break-all border mt-1'>
                {txHash}
              </span>
            </div>
          )}

          <p className='text-xs text-muted leading-relaxed'>
            Transactions are broadcasted to the blockchain node network. Status updates can take a few seconds depending on congestion levels.
          </p>
        </div>

        <div className='flex justify-end gap-3 pt-2 border-t'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-accent hover:bg-accent-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 text-white text-sm font-semibold rounded-lg transition'
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusModal;