import React, { useEffect, useMemo, useState } from 'react';

type GraphPaginationViewProps = {
  title?: string;
  account?: string;
};

const GraphPaginationView: React.FC<GraphPaginationViewProps> = ({ title, account }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 250);

    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(prev => [...prev]);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(debouncedSearch));
  }, [items, debouncedSearch]);

  const executeAction = (index: number) => {
    console.log(`Processing graph rendering section ${index}`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  return (
    <div className='p-4 border rounded-xl shadow-sm'>
      <h2 className='text-xl font-bold'>{title || 'Graph Rendering Module'}</h2>
      {account && <p className='text-xs text-secondary mb-2'>Account: {account}</p>}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder='Search records (debounced)...'
        className='border p-2 rounded-md w-full my-2'
      />

      <div className='space-y-2 max-h-48 overflow-y-auto'>
        {filteredItems.map((item, index) => (
          <div key={index} className='border p-2 rounded-lg text-sm bg-elevated'>
            {item}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className='text-xs text-muted text-center py-4'>No records found</p>
        )}
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <button
            key={index}
            onClick={() => executeAction(index)}
            className='px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition'
          >
            Render {index}
          </button>
        ))}
      </div>

      {loading && <p className='mt-2 text-xs text-accent animate-pulse'>Rendering Subgraph...</p>}
    </div>
  );
};

export default GraphPaginationView;