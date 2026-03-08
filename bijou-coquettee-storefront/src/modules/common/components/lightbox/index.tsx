"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import Image from "next/image"

interface LightboxImage {
    src: string
    alt?: string
    caption?: string
}

interface LightboxProps {
    images: LightboxImage[]
    initialIndex: number
    onClose: () => void
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isVisible, setIsVisible] = useState(false)
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)

    const total = images.length
    const current = images[currentIndex]

    // Fade in on mount
    useEffect(() => {
        const id = requestAnimationFrame(() => setIsVisible(true))
        return () => cancelAnimationFrame(id)
    }, [])

    // Lock body scroll
    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])

    const handleClose = useCallback(() => {
        setIsVisible(false)
        // Allow fade-out before unmounting
        setTimeout(onClose, 200)
    }, [onClose])

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1))
    }, [total])

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1))
    }, [total])

    // Keyboard navigation
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose()
            if (e.key === "ArrowLeft") handlePrev()
            if (e.key === "ArrowRight") handleNext()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [handleClose, handlePrev, handleNext])

    // Touch swipe handlers
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchEndX.current = null
    }

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const onTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return
        const delta = touchStartX.current - touchEndX.current
        if (Math.abs(delta) >= 50) {
            if (delta > 0) {
                handleNext()
            } else {
                handlePrev()
            }
        }
        touchStartX.current = null
        touchEndX.current = null
    }

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 transition-opacity duration-200 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClose}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
        >
            {/* Counter — top left */}
            <div className="absolute top-4 left-5 z-10 font-sans text-xs text-white/70 tracking-[0.12em]">
                {currentIndex + 1} / {total}
            </div>

            {/* Close button — top right */}
            <button
                className="absolute top-4 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                onClick={handleClose}
                aria-label="Close lightbox"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                >
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Prev button */}
            {total > 1 && (
                <button
                    className="absolute left-3 small:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    onClick={(e) => {
                        e.stopPropagation()
                        handlePrev()
                    }}
                    aria-label="Previous image"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
            )}

            {/* Next button */}
            {total > 1 && (
                <button
                    className="absolute right-3 small:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleNext()
                    }}
                    aria-label="Next image"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            )}

            {/* Image + caption */}
            <div
                className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative max-h-[80vh] max-w-[90vw] overflow-hidden rounded-sm">
                    <Image
                        key={currentIndex}
                        src={current.src}
                        alt={current.alt ?? `Image ${currentIndex + 1}`}
                        width={1200}
                        height={900}
                        className="max-h-[80vh] w-auto rounded-sm object-contain"
                        priority
                        sizes="90vw"
                    />
                </div>

                {current.caption && (
                    <p className="max-w-xl text-center font-sans text-xs font-light leading-relaxed text-white/60">
                        {current.caption}
                    </p>
                )}
            </div>
        </div>
    )
}
