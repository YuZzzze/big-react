import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num] = useState(1000);
	return <div>{num}</div>;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App></App>
);
