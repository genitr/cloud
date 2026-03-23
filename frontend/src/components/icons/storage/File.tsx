import type { SVGProps } from 'react';

export function File(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 48 48" {...props}><path fill="#90caf9" d="M40 45H8V3h22l10 10z"></path><path fill="#e1f5fe" d="M38.5 14H29V4.5z"></path></svg>);
}