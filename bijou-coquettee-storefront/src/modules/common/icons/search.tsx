import React from "react"

import { IconProps } from "types/icon"

const SearchIcon: React.FC<IconProps> = ({
    size = "20",
    color = "currentColor",
    ...attributes
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...attributes}
        >
            <path
                d="M15.5 15.5L20 20"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="11"
                cy="11"
                r="6.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default SearchIcon


