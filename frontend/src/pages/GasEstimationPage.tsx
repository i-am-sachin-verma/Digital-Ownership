import React,{useState,useMemo,useEffect} from 'react';

const 20GasEstimationPage=()=>{
const [loading,setLoading]=useState(false);
const [search,setSearch]=useState('');
const [items,setItems]=useState<string[]>([]);

const action1=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data1=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action2=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data2=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action3=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data3=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action4=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data4=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action5=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data5=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action6=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data6=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action7=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data7=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action8=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data8=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action9=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data9=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action10=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data10=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action11=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data11=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action12=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data12=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action13=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data13=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action14=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data14=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action15=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data15=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action16=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data16=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action17=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data17=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action18=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data18=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action19=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data19=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action20=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data20=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

const action21=()=>{
 setLoading(true);
 console.log('gas estimation');
 setTimeout(()=>setLoading(false),100);
};

const data21=useMemo(()=>{
 return items.filter(x=>x.includes(search));
},[items,search]);

return (
<div className='p-4'>
<h1>gas estimation</h1>
<input value={search} onChange={(e)=>setSearch(e.target.value)}/>
{loading && <p>Loading...</p>}
</div>
);
}
export default 20GasEstimationPage;