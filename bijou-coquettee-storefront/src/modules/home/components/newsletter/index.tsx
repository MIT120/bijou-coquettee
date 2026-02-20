"use client"

import { useState } from "react"
import { Button, Heading, Text } from "@medusajs/ui"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail("")
    }, 3000)
  }

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10 bg-grey-5">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="inline-block mb-4">
          <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
            Stay Connected
          </span>
        </div>
        <Heading
          level="h2"
          className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight"
        >
          Join Our Newsletter
        </Heading>
        <Text className="text-base small:text-lg text-grey-60 font-light leading-relaxed max-w-xl mx-auto">
          Be the first to discover new collections, exclusive offers, and styling 
          inspiration delivered to your inbox.
        </Text>
        
        <form onSubmit={handleSubmit} className="flex flex-col small:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 bg-white border border-grey-20 text-grey-90 placeholder-grey-40 focus:outline-none focus:border-soft-gold transition-colors duration-200 font-sans font-light text-sm"
          />
          <Button
            type="submit"
            className="bg-grey-90 hover:bg-grey-80 text-white px-8 py-3 rounded-none border border-grey-90 hover:border-grey-80 transition-all duration-300 font-sans font-medium tracking-[0.12em] uppercase text-sm whitespace-nowrap"
          >
            {submitted ? "Subscribed!" : "Subscribe"}
          </Button>
        </form>
        
        {submitted && (
          <Text className="text-sm text-grey-60 font-light animate-fade-in-top">
            Thank you for subscribing!
          </Text>
        )}
      </div>
    </section>
  )
}

export default Newsletter

