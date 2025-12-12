import {
  defineMiddlewares,
  authenticate,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Wishlist routes - require customer authentication
    {
      matcher: "/store/wishlist",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/wishlist/*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})