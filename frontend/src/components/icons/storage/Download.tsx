import type { SVGProps } from 'react';

export function Download(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={8} height={8} viewBox="0 0 8 8" {...props}><path fill="#37c749" d="M7 7v1H1V7m2-3V1h2v3h2L4 7L1 4"></path></svg>);
}