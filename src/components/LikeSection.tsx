import { useState } from 'react';

const LikeSection = () => {
    const [inputValue, setInputValue] = useState('');
  return (
    <div>
      <input className='border rounded p-2' type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
    </div>
  )
}

export default LikeSection
