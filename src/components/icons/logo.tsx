import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1.5em"
      height="1.5em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M 128,32.000001 V 96 l 64,-32 z m -16,80 v 112 l 16,-16 z m 16,0 48,32 -48,32 z"
        style={{
          strokeWidth: 16,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          stroke: 'currentColor',
          fill: 'none',
        }}
      />
    </svg>
  );
}
