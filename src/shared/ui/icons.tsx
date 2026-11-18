import type { ReactNode } from 'react';

type IconProps = { size?: number };

function Svg({ size = 20, children }: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export const HomeIcon = (p: IconProps) => (
    <Svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Svg>
);
export const WalletIcon = (p: IconProps) => (
    <Svg {...p}><path d="M3 7a2 2 0 012-2h13v4" /><path d="M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z" /><circle cx="16.5" cy="14.5" r="1" /></Svg>
);
export const ListIcon = (p: IconProps) => (
    <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></Svg>
);
export const SwapIcon = (p: IconProps) => (
    <Svg {...p}><path d="M7 4L3 8l4 4" /><path d="M3 8h14" /><path d="M17 20l4-4-4-4" /><path d="M21 16H7" /></Svg>
);
export const TargetIcon = (p: IconProps) => (
    <Svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></Svg>
);
export const BellIcon = (p: IconProps) => (
    <Svg {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 004 0" /></Svg>
);
export const LogoutIcon = (p: IconProps) => (
    <Svg {...p}><path d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4" /><path d="M16 8l4 4-4 4" /><path d="M20 12H9" /></Svg>
);
export const ArrowUpIcon = (p: IconProps) => (
    <Svg {...p}><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></Svg>
);
export const ArrowDownIcon = (p: IconProps) => (
    <Svg {...p}><path d="M12 5v14" /><path d="M6 13l6 6 6-6" /></Svg>
);
export const LockIcon = (p: IconProps) => (
    <Svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></Svg>
);
export const PlusIcon = (p: IconProps) => (
    <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>
);
export const EditIcon = (p: IconProps) => (
    <Svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></Svg>
);
export const TrashIcon = (p: IconProps) => (
    <Svg {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></Svg>
);
export const CloseIcon = (p: IconProps) => (
    <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);
export const UserIcon = (p: IconProps) => (
    <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></Svg>
);
export const StarIcon = (p: IconProps) => (
    <Svg {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></Svg>
);
export const CheckIcon = (p: IconProps) => (
    <Svg {...p}><path d="M5 12l4.5 4.5L19 7" /></Svg>
);
export const MinusIcon = (p: IconProps) => (
    <Svg {...p}><path d="M6 12h12" /></Svg>
);
