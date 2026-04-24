import { useState, useEffect } from 'react'

const slides = [
  {
    title: "Rajalakshmi Institute of Technology",
    description: "Welcome to RIT - Nurturing the innovators and leaders of tomorrow with state-of-the-art infrastructure.",
    image: "/carousel/campus-building-1.png",
    color: "from-blue-600 to-indigo-700"
  },
  {
    title: "World-Class Campus",
    description: "Experience learning in a lush green, eco-friendly campus designed for academic excellence.",
    image: "/carousel/campus-aerial.png",
    color: "from-indigo-600 to-purple-700"
  },
  {
    title: "Advanced Facilities",
    description: "Equipped with modern laboratories, comprehensive libraries, and advanced research centers.",
    image: "/carousel/campus-building-2.png",
    color: "from-purple-600 to-pink-700"
  },
  {
    title: "Empowering Education",
    description: "A comprehensive hub for holistic development, integrating technology with practical learning.",
    image: "/carousel/campus-collage.png",
    color: "from-blue-500 to-teal-600"
  },
  {
    title: "Excellence in Engineering",
    description: "Join the legacy of excellence and shape your future with our cutting-edge programs.",
    image: "/carousel/rit-logo.png",
    color: "from-blue-600 to-indigo-600"
  }
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl group">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
            index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
          }`}
        >
          {/* Overlay Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-80 mix-blend-multiply z-10`}></div>
          
          {/* Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Content */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
            <div className="max-w-md animate-slide-up">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full">
                Featured Feature
              </span>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                {slide.title}
              </h2>
              <p className="text-lg text-white/80 font-medium leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-12 right-12 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-500 rounded-full ${
              index === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
      

    </div>
  )
}
