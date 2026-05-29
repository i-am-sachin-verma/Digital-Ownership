import React, { useEffect, useMemo, useState } from 'react';

type UpgradeableContractManagerProps = {
  title?: string;
  account?: string;
};

const UpgradeableContractManager: React.FC<UpgradeableContractManagerProps> = ({ title, account }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(prev => [...prev]);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.includes(search));
  }, [items, search]);

  const executeAction = (index: number) => {
    console.log(`Processing upgradeable contracts section ${index}`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  return (
    <div className='p-4 border rounded-xl shadow-sm'>
      <h2 className='text-xl font-bold'>{title || 'Upgradeable Contracts Module'}</h2>
      {account && <p className='text-sm text-secondary'>Connected: {account}</p>}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search records'
        className='border p-2 rounded-md w-full my-2'
      />

      <div className='space-y-2'>
        {filteredItems.map((item, index) => (
          <div key={index} className='border p-2 rounded-lg'>
            {item}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4'>
        {Array.from({ length: 19 }).map((_, index) => (
          <button
            key={index}
            onClick={() => executeAction(index)}
            className='px-4 py-2 border rounded-lg hover:bg-slate-50 transition'
          >
            Execute Action {index}
          </button>
        ))}
      </div>

      {loading && <p className='mt-2 text-sm text-accent animate-pulse'>Loading...</p>}
    </div>
  );
};

export default UpgradeableContractManager;