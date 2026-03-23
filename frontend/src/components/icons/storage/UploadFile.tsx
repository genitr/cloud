import type { SVGProps } from 'react';

export function UploadFile(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 14 14" {...props}><g fill="none"><path fill="#d7e0ff" d="M12.5 12.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H9L12.5 4z"></path><path stroke="#4147d5" strokeLinecap="round" strokeLinejoin="round" d="M12.5 12.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H9L12.5 4z" strokeWidth={1}></path><path stroke="#4147d5" strokeLinecap="round" strokeLinejoin="round" d="m9 6.5l-2-2l-2 2m2-2V10" strokeWidth={1}></path></g></svg>);
}