"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, ZoomIn, Maximize2 } from "lucide-react"

type ImageGalleryProps = {
    images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const imageRef = useRef<HTMLDivElement>(null)
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)

    const currentImage = images[selectedImageIndex]

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                )
                setIsZoomed(false)
            } else if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) => (prev + 1) % images.length)
                setIsZoomed(false)
            } else if (e.key === "Escape") {
                setIsFullscreen(false)
                setIsZoomed(false)
            }
        }

        window.addEventListener("keydown", handleKeyPress)
        return () => window.removeEventListener("keydown", handleKeyPress)
    }, [images.length])

    const navigateNext = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length)
        setIsZoomed(false)
    }

    const navigatePrevious = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        )
        setIsZoomed(false)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setZoomPosition({ x, y })
    }

    const handleMouseEnter = () => {
        setIsZoomed(true)
    }

    const handleMouseLeave = () => {
        setIsZoomed(false)
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
        setIsZoomed(false)
    }

    // Handle touch gestures for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const swipeThreshold = 50
        const diff = touchStartX.current - touchEndX.current

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next image
                navigateNext()
            } else {
                // Swiped right - previous image
                navigatePrevious()
            }
        }

        touchStartX.current = 0
        touchEndX.current = 0
    }

    if (!images || images.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-ui-bg-subtle rounded-lg">
                <p className="text-ui-fg-muted">No images available</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            {/* Main Image Container */}
            <div className="relative shadow-lg rounded-lg overflow-hidden">
                <Container
                    className="relative aspect-[4/5] w-full overflow-hidden bg-ui-bg-subtle group cursor-zoom-in touch-pan-x"
                    ref={imageRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => !isZoomed && toggleFullscreen()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {currentImage?.url && (
                        <Image
                            src={currentImage.url}
                            alt={`Product image ${selectedImageIndex + 1}`}
                            fill
                            priority={selectedImageIndex === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            className={`rounded-lg transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"
                                }`}
                            style={{
                                objectFit: "cover",
                                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }}
                        />
                    )}

                    {/* Zoom Indicator */}
                    {!isZoomed && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg">
                            <ZoomIn className="w-5 h-5 text-gray-800" />
                        </div>
                    )}

                    {/* Fullscreen Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleFullscreen()
                        }}
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 backdrop-blur-sm hover:bg-white p-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                        aria-label="View fullscreen"
                    >
                        <Maximize2 className="w-5 h-5 text-gray-800" />
                    </button>

                    {/* Navigation Arrows (only show if multiple images) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigatePrevious()
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 disabled:opacity-50"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-800" />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigateNext()
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-800" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    )}
                </Container>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {images.map((image, index) => (
                        <button
                            key={image.id || index}
                            onClick={() => {
                                setSelectedImageIndex(index)
                                setIsZoomed(false)
                            }}
                            className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-sm hover:shadow-md ${index === selectedImageIndex
                                ? "border-ui-fg-base ring-2 ring-ui-fg-base ring-offset-2 shadow-md scale-105"
                                : "border-ui-border-base hover:border-ui-fg-subtle hover:scale-102"
                                }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            {image.url && (
                                <Image
                                    src={image.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    {/* Close Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
                        aria-label="Close fullscreen"
                    >
                        <X className="w-7 h-7 text-white" />
                    </button>

                    {/* Navigation in Fullscreen */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={navigatePrevious}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>

                            <button
                                onClick={navigateNext}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all duration-200 hover:scale-110 shadow-xl"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        </>
                    )}

                    {/* Fullscreen Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
                        {currentImage?.url && (
                            <Image
                                src={currentImage.url}
                                alt={`Product image ${selectedImageIndex + 1}`}
                                fill
                                sizes="100vw"
                                className="object-contain"
                                priority
                            />
                        )}
                    </div>

                    {/* Fullscreen Counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/15 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-medium shadow-xl">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Fullscreen Thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-3 max-w-full overflow-x-auto px-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
                            {images.map((image, index) => (
                                <button
                                    key={image.id || index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shadow-lg ${index === selectedImageIndex
                                        ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110"
                                        : "border-white/30 hover:border-white/60 hover:scale-105"
                                        }`}
                                >
                                    {image.url && (
                                        <Image
                                            src={image.url}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImageGallery

