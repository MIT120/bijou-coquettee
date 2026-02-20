import React from "react"

import { IconProps } from "types/icon"

const Instagram: React.FC<IconProps> = ({
    size = "20",
    color = "currentColor",
    ...attributes
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...attributes}
        >
            <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="4"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="10"
                cy="10"
                r="3"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="14.5" cy="5.5" r="0.75" fill={color} />
        </svg>
    )
}

export default Instagram
