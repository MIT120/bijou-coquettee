import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full h-[85vh] small:h-[90vh] overflow-hidden bg-gradient-to-b from-grey-0 via-grey-5 to-grey-10">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-amber-100 to-transparent rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-amber-50 to-transparent rounded-full blur-3xl opacity-15"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-50/10 to-transparent rounded-full blur-3xl opacity-10"></div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 small:px-32">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-top">
          {/* Elegant heading */}
          <div className="space-y-4">
            <div className="inline-block mb-4">
              <span className="text-xs small:text-sm tracking-[0.3em] uppercase text-grey-60 font-light letter-spacing-wider">
                Bijou Coquettee
              </span>
            </div>
            <Heading
              level="h1"
              className="text-4xl small:text-6xl large:text-7xl leading-tight text-grey-90 font-light tracking-tight"
            >
              Timeless Elegance
            </Heading>
            <Heading
              level="h2"
              className="text-xl small:text-2xl large:text-3xl leading-relaxed text-grey-60 font-light mt-4 max-w-2xl mx-auto"
            >
              Discover our curated collection of exquisite jewelry,
              crafted with precision and passion
            </Heading>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col small:flex-row items-center justify-center gap-4 pt-4">
            <LocalizedClientLink href="/store">
              <Button
                size="large"
                className="bg-grey-90 hover:bg-grey-80 text-white px-8 py-3 rounded-none border border-grey-90 hover:border-grey-80 transition-all duration-300 font-light tracking-wide uppercase text-sm letter-spacing-wider"
              >
                Shop Collection
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/collections">
              <Button
                variant="secondary"
                size="large"
                className="bg-transparent hover:bg-grey-90 hover:text-white text-grey-90 px-8 py-3 rounded-none border border-grey-30 hover:border-grey-90 transition-all duration-300 font-light tracking-wide uppercase text-sm letter-spacing-wider"
              >
                Explore
              </Button>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-grey-40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-grey-40 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
