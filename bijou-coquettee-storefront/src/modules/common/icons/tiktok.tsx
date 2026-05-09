import React from "react"

import { IconProps } from "types/icon"

const TikTok: React.FC<IconProps> = ({
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
            <path
                d="M13.5 2C13.5 2 13.8 4.5 16.5 5V7.5C16.5 7.5 14.5 7.5 13.5 6.5V12.5C13.5 15.538 11.038 18 8 18C4.962 18 2.5 15.538 2.5 12.5C2.5 9.462 4.962 7 8 7C8.345 7 8.68 7.037 9 7.105V9.654C8.686 9.553 8.351 9.5 8 9.5C6.343 9.5 5 10.843 5 12.5C5 14.157 6.343 15.5 8 15.5C9.657 15.5 11 14.157 11 12.5V2H13.5Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default TikTok
