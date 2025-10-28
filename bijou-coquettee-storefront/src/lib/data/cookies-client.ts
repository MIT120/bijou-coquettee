// Client-safe version of cookies utilities
// This file can be imported in both server and client components

export const getAuthHeaders = (): { authorization: string } | {} => {
    // For client-side usage, we can't access cookies directly
    // This should be handled by the server or through API calls
    return {}
}

export const getCacheTag = (tag: string): string => {
    // For client-side usage, we can't access cache tags
    return ""
}

export const getCacheOptions = (tag: string): { tags: string[] } | {} => {
    // For client-side usage, we don't use cache options
    return {}
}

// These functions are not available on the client side
// They should only be called from server components
export const setAuthToken = async (token: string) => {
    throw new Error("setAuthToken can only be called from server components")
}

export const removeAuthToken = async () => {
    throw new Error("removeAuthToken can only be called from server components")
}

export const getCartId = async () => {
    throw new Error("getCartId can only be called from server components")
}

export const setCartId = async (cartId: string) => {
    throw new Error("setCartId can only be called from server components")
}

export const removeCartId = async () => {
    throw new Error("removeCartId can only be called from server components")
}
