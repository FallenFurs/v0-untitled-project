"use client"

import { useEffect, useRef, useState } from "react"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const starsRef = useRef<
    Array<{
      x: number
      y: number
      size: number
      brightness: number
      brightnessDelta: number
      constellation: number | null
      color?: string
    }>
  >([])
  const shootingStarsRef = useRef<
    Array<{
      x: number
      y: number
      endX: number
      endY: number
      speed: number
      progress: number
      length: number
      opacity: number
      active: boolean
    }>
  >([])
  const satelliteRef = useRef<{
    centerX: number
    centerY: number
    orbitRadius: number
    orbitSpeed: number
    orbitAngle: number
    size: number
  }>()
  const planetsRef = useRef<
    Array<{
      centerX: number
      centerY: number
      orbitRadius: number
      orbitSpeed: number
      orbitAngle: number
      radius: number
      color: string
      hasRings: boolean
      ringColor: string
      ringWidth: number
      ringAngle: number
      details: Array<{
        type: "crater" | "spot" | "band" | "cloud"
        x: number
        y: number
        size: number
        color: string
        angle?: number
        width?: number
      }>
      hasMoon?: boolean
      moonSize?: number
      moonColor?: string
      moonDistance?: number
      moonSpeed?: number
      moonAngle?: number
    }>
  >([])
  const constellationsRef = useRef<
    Array<{
      name: string
      stars: Array<{
        x: number
        y: number
        size: number
        brightness: number
        brightnessDelta: number
      }>
      connections: Array<[number, number]>
      nameX: number
      nameY: number
    }>
  >([])
  const galaxyRef = useRef<{
    x: number
    y: number
    radius: number
    rotation: number
    rotationSpeed: number
    blackHoleX: number
    blackHoleY: number
    blackHoleRadius: number
    sunX: number
    sunY: number
    sunRadius: number
  }>()
  const centerBlackHoleRef = useRef<{
    x: number
    y: number
    radius: number
    rotation: number
    rotationSpeed: number
  }>()
  const shootingStarTimerRef = useRef<number>(0)
  const requestRef = useRef<number>()
  const timeRef = useRef<number>(0)
  const [sceneId, setSceneId] = useState<string>("")

  // Generate a unique scene ID on mount to force re-initialization on refresh
  useEffect(() => {
    setSceneId(Math.random().toString(36).substring(2, 15))
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect()
        setDimensions({ width, height })
        canvasRef.current.width = width
        canvasRef.current.height = height

        // Reinitialize elements when canvas size changes
        initializeStars()
        initializePlanets()
        initializeGalaxy()
        initializeConstellations()
        initializeCenterBlackHole()
        initializeSatellite()
        initializeShootingStars()
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [sceneId]) // Add sceneId as dependency to reinitialize on refresh

  // Random color generator functions
  const getRandomColor = (
    baseHue: number,
    hueRange: number,
    satRange: [number, number],
    lightRange: [number, number],
    alpha = 1,
  ) => {
    const hue = baseHue + (Math.random() * hueRange - hueRange / 2)
    const saturation = Math.random() * (satRange[1] - satRange[0]) + satRange[0]
    const lightness = Math.random() * (lightRange[1] - lightRange[0]) + lightRange[0]
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
  }

  const getRandomRGBA = (r: [number, number], g: [number, number], b: [number, number], a: [number, number]) => {
    const red = Math.floor(Math.random() * (r[1] - r[0]) + r[0])
    const green = Math.floor(Math.random() * (g[1] - g[0]) + g[0])
    const blue = Math.floor(Math.random() * (b[1] - b[0]) + b[0])
    const alpha = Math.random() * (a[1] - a[0]) + a[0]
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  // Initialize stars (completely stagnant)
  const initializeStars = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current
    const stars = []
    // Randomize star count between 350-450
    const numStars = Math.floor(Math.random() * 100) + 350

    // Create different star types for more realism
    const starTypes = [
      { size: [0.5, 1.2], brightness: [0.5, 0.8], color: "255, 255, 255" }, // White stars
      { size: [0.5, 1.5], brightness: [0.5, 0.9], color: "255, 240, 220" }, // Slightly yellow stars
      { size: [0.5, 1.3], brightness: [0.5, 0.8], color: "220, 240, 255" }, // Slightly blue stars
      { size: [0.5, 1.4], brightness: [0.5, 0.9], color: "255, 220, 220" }, // Slightly red stars
      { size: [0.4, 1.0], brightness: [0.5, 0.7], color: "200, 220, 255" }, // Cool blue stars
      { size: [0.6, 1.6], brightness: [0.6, 0.9], color: "255, 220, 180" }, // Warm orange stars
    ]

    // Randomize star distribution - create areas of higher and lower density
    const densityRegions = []
    const numDensityRegions = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < numDensityRegions; i++) {
      densityRegions.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (width / 3) + width / 6,
        density: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      })
    }

    for (let i = 0; i < numStars; i++) {
      // Decide if this star should be in a density region
      let x, y
      if (Math.random() < 0.7) {
        // 70% of stars in density regions
        const region = densityRegions[Math.floor(Math.random() * densityRegions.length)]
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * region.radius
        x = region.x + Math.cos(angle) * distance
        y = region.y + Math.sin(angle) * distance

        // Keep within canvas bounds
        x = Math.max(0, Math.min(width, x))
        y = Math.max(0, Math.min(height, y))
      } else {
        // Random position anywhere
        x = Math.random() * width
        y = Math.random() * height
      }

      // Select a random star type
      const starType = starTypes[Math.floor(Math.random() * starTypes.length)]
      const size = Math.random() * (starType.size[1] - starType.size[0]) + starType.size[0]
      const brightness = Math.random() * (starType.brightness[1] - starType.brightness[0]) + starType.brightness[0]

      stars.push({
        x: x,
        y: y,
        size: size,
        brightness: brightness,
        brightnessDelta: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1), // Smoother twinkling
        constellation: null,
        color: starType.color, // Add color property
      })
    }

    starsRef.current = stars
  }

  // Initialize shooting stars
  const initializeShootingStars = () => {
    if (!canvasRef.current) return

    // Create array to hold shooting stars
    shootingStarsRef.current = []
  }

  // Create a new shooting star
  const createShootingStar = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current

    // Determine start and end points
    const startX = Math.random() * width
    const startY = Math.random() * height * 0.5 // Start in upper half
    const angle = Math.PI / 4 + (Math.random() * Math.PI) / 2 // Angle between PI/4 and 3PI/4 (diagonal down)
    const distance = Math.random() * width * 0.3 + width * 0.2 // Travel distance

    const endX = startX + Math.cos(angle) * distance
    const endY = startY + Math.sin(angle) * distance

    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      endX: endX,
      endY: endY,
      speed: Math.random() * 0.003 + 0.002, // Speed of shooting star
      progress: 0, // Progress from 0 to 1
      length: Math.random() * 50 + 50, // Length of trail
      opacity: Math.random() * 0.5 + 0.5, // Maximum opacity
      active: true,
    })
  }

  // Initialize satellite
  const initializeSatellite = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current

    // Find an Earth-like planet to orbit
    let earthPlanetIndex = -1
    if (planetsRef.current.length > 0) {
      for (let i = 0; i < planetsRef.current.length; i++) {
        if (planetsRef.current[i].color.includes("rgba(70, 130, 180")) {
          earthPlanetIndex = i
          break
        }
      }
    }

    // If no Earth-like planet found, use a random position
    let centerX, centerY, planetRadius

    if (earthPlanetIndex >= 0) {
      centerX = planetsRef.current[earthPlanetIndex].centerX
      centerY = planetsRef.current[earthPlanetIndex].centerY
      planetRadius = planetsRef.current[earthPlanetIndex].radius
    } else {
      // Random position that's not too close to the edges
      centerX = width * (0.3 + Math.random() * 0.4)
      centerY = height * (0.3 + Math.random() * 0.4)
      planetRadius = 20
    }

    satelliteRef.current = {
      centerX: centerX,
      centerY: centerY,
      orbitRadius: planetRadius * (2 + Math.random()), // Randomize orbit distance
      orbitSpeed: 0.0003 + Math.random() * 0.0004, // Randomize speed
      orbitAngle: Math.random() * Math.PI * 2,
      size: 3 + Math.random() * 2, // Randomize size
    }
  }

  // Initialize planets
  const initializePlanets = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current
    const planets = []

    // Randomize number of planets between 5-8
    let numPlanets = Math.floor(Math.random() * 4) + 5

    // Generate color themes for this scene
    const colorTheme = Math.floor(Math.random() * 5)
    let planetTypes = []

    switch (colorTheme) {
      case 0: // Blue/Green theme
        planetTypes = [
          {
            name: "Earth-like",
            color: getRandomRGBA([50, 90], [110, 150], [160, 200], [0.7, 0.9]),
            hasRings: Math.random() > 0.8,
            detailTypes: ["cloud", "spot"],
            detailColors: [
              getRandomRGBA([220, 255], [220, 255], [220, 255], [0.6, 0.8]),
              getRandomRGBA([20, 40], [60, 100], [20, 40], [0.5, 0.7]),
            ],
            hasMoon: Math.random() > 0.4,
            moonSize: 0.15 + Math.random() * 0.15,
            moonColor: getRandomRGBA([180, 220], [180, 220], [180, 220], [0.7, 0.9]),
            moonDistance: 1.6 + Math.random() * 0.6,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
          {
            name: "Gas Giant",
            color: getRandomRGBA([190, 230], [160, 200], [120, 160], [0.7, 0.9]),
            hasRings: Math.random() > 0.3,
            ringColor: getRandomRGBA([160, 200], [140, 180], [100, 140], [0.4, 0.6]),
            detailTypes: ["band", "spot"],
            detailColors: [
              getRandomRGBA([160, 200], [120, 160], [80, 120], [0.5, 0.7]),
              getRandomRGBA([200, 240], [180, 220], [130, 170], [0.6, 0.8]),
            ],
            hasMoon: Math.random() > 0.3,
            moonSize: 0.1 + Math.random() * 0.15,
            moonColor: getRandomRGBA([160, 200], [160, 200], [160, 200], [0.7, 0.9]),
            moonDistance: 1.8 + Math.random() * 0.6,
            moonSpeed: 0.0008 + Math.random() * 0.0008,
          },
        ]
        break

      case 1: // Red/Orange theme
        planetTypes = [
          {
            name: "Mars-like",
            color: getRandomRGBA([180, 220], [80, 120], [50, 90], [0.7, 0.9]),
            hasRings: Math.random() > 0.8,
            detailTypes: ["crater", "spot"],
            detailColors: [
              getRandomRGBA([130, 170], [50, 90], [30, 70], [0.5, 0.7]),
              getRandomRGBA([200, 240], [100, 140], [60, 100], [0.4, 0.6]),
            ],
            hasMoon: Math.random() > 0.6,
            moonSize: 0.1 + Math.random() * 0.1,
            moonColor: getRandomRGBA([160, 200], [160, 200], [160, 200], [0.7, 0.9]),
            moonDistance: 1.7 + Math.random() * 0.5,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
          {
            name: "Lava Planet",
            color: getRandomRGBA([200, 240], [60, 100], [20, 60], [0.7, 0.9]),
            hasRings: Math.random() > 0.7,
            ringColor: getRandomRGBA([180, 220], [100, 140], [50, 90], [0.4, 0.6]),
            detailTypes: ["spot", "band"],
            detailColors: [
              getRandomRGBA([235, 255], [100, 140], [30, 70], [0.6, 0.8]),
              getRandomRGBA([160, 200], [40, 80], [10, 30], [0.5, 0.7]),
            ],
            hasMoon: Math.random() > 0.7,
            moonSize: 0.12 + Math.random() * 0.1,
            moonColor: getRandomRGBA([100, 140], [100, 140], [100, 140], [0.7, 0.9]),
            moonDistance: 1.6 + Math.random() * 0.6,
            moonSpeed: 0.0012 + Math.random() * 0.0008,
          },
        ]
        break

      case 2: // Ice/Blue theme
        planetTypes = [
          {
            name: "Ice Giant",
            color: getRandomRGBA([100, 140], [160, 200], [200, 240], [0.7, 0.9]),
            hasRings: Math.random() > 0.4,
            ringColor: getRandomRGBA([180, 220], [200, 240], [235, 255], [0.4, 0.6]),
            detailTypes: ["band", "spot"],
            detailColors: [
              getRandomRGBA([80, 120], [130, 170], [180, 220], [0.5, 0.7]),
              getRandomRGBA([130, 170], [180, 220], [235, 255], [0.4, 0.6]),
            ],
            hasMoon: Math.random() > 0.5,
            moonSize: 0.15 + Math.random() * 0.15,
            moonColor: getRandomRGBA([200, 240], [200, 240], [200, 240], [0.7, 0.9]),
            moonDistance: 1.8 + Math.random() * 0.6,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
          {
            name: "Ice Planet",
            color: getRandomRGBA([180, 220], [200, 240], [235, 255], [0.7, 0.9]),
            hasRings: Math.random() > 0.6,
            ringColor: getRandomRGBA([200, 240], [220, 255], [235, 255], [0.4, 0.6]),
            detailTypes: ["crater", "spot"],
            detailColors: [
              getRandomRGBA([235, 255], [235, 255], [235, 255], [0.6, 0.8]),
              getRandomRGBA([160, 200], [180, 220], [200, 240], [0.5, 0.7]),
            ],
            hasMoon: Math.random() > 0.6,
            moonSize: 0.1 + Math.random() * 0.12,
            moonColor: getRandomRGBA([160, 200], [160, 200], [180, 220], [0.7, 0.9]),
            moonDistance: 1.6 + Math.random() * 0.5,
            moonSpeed: 0.0015 + Math.random() * 0.001,
          },
        ]
        break

      case 3: // Purple/Pink theme
        planetTypes = [
          {
            name: "Alien World",
            color: getRandomRGBA([130, 170], [80, 120], [160, 200], [0.7, 0.9]),
            hasRings: Math.random() > 0.5,
            ringColor: getRandomRGBA([160, 200], [100, 140], [180, 220], [0.4, 0.6]),
            detailTypes: ["spot", "cloud"],
            detailColors: [
              getRandomRGBA([160, 200], [60, 100], [180, 220], [0.5, 0.7]),
              getRandomRGBA([200, 240], [120, 160], [220, 255], [0.4, 0.6]),
            ],
            hasMoon: Math.random() > 0.4,
            moonSize: 0.15 + Math.random() * 0.15,
            moonColor: getRandomRGBA([180, 220], [160, 200], [200, 240], [0.7, 0.9]),
            moonDistance: 1.7 + Math.random() * 0.6,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
          {
            name: "Gas Giant",
            color: getRandomRGBA([160, 200], [100, 140], [180, 220], [0.7, 0.9]),
            hasRings: Math.random() > 0.3,
            ringColor: getRandomRGBA([180, 220], [120, 160], [200, 240], [0.4, 0.6]),
            detailTypes: ["band", "spot"],
            detailColors: [
              getRandomRGBA([140, 180], [80, 120], [160, 200], [0.5, 0.7]),
              getRandomRGBA([180, 220], [120, 160], [200, 240], [0.4, 0.6]),
            ],
            hasMoon: Math.random() > 0.5,
            moonSize: 0.12 + Math.random() * 0.13,
            moonColor: getRandomRGBA([160, 200], [160, 200], [180, 220], [0.7, 0.9]),
            moonDistance: 1.8 + Math.random() * 0.5,
            moonSpeed: 0.0012 + Math.random() * 0.0008,
          },
        ]
        break

      default: // Mixed theme
        planetTypes = [
          {
            name: "Earth-like",
            color: getRandomRGBA([50, 90], [110, 150], [160, 200], [0.7, 0.9]),
            hasRings: Math.random() > 0.8,
            detailTypes: ["cloud", "spot"],
            detailColors: [
              getRandomRGBA([220, 255], [220, 255], [220, 255], [0.6, 0.8]),
              getRandomRGBA([20, 40], [60, 100], [20, 40], [0.5, 0.7]),
            ],
            hasMoon: Math.random() > 0.5,
            moonSize: 0.15 + Math.random() * 0.15,
            moonColor: getRandomRGBA([180, 220], [180, 220], [180, 220], [0.7, 0.9]),
            moonDistance: 1.7 + Math.random() * 0.5,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
          {
            name: "Gas Giant",
            color: getRandomRGBA([190, 230], [160, 200], [120, 160], [0.7, 0.9]),
            hasRings: Math.random() > 0.3,
            ringColor: getRandomRGBA([160, 200], [140, 180], [100, 140], [0.4, 0.6]),
            detailTypes: ["band", "spot"],
            detailColors: [
              getRandomRGBA([160, 200], [120, 160], [80, 120], [0.5, 0.7]),
              getRandomRGBA([200, 240], [180, 220], [130, 170], [0.6, 0.8]),
            ],
            hasMoon: Math.random() > 0.5,
            moonSize: 0.12 + Math.random() * 0.13,
            moonColor: getRandomRGBA([160, 200], [160, 200], [160, 200], [0.7, 0.9]),
            moonDistance: 1.8 + Math.random() * 0.5,
            moonSpeed: 0.0012 + Math.random() * 0.0008,
          },
          {
            name: "Alien World",
            color: getRandomRGBA([130, 170], [80, 120], [160, 200], [0.7, 0.9]),
            hasRings: Math.random() > 0.5,
            ringColor: getRandomRGBA([160, 200], [100, 140], [180, 220], [0.4, 0.6]),
            detailTypes: ["spot", "cloud"],
            detailColors: [
              getRandomRGBA([160, 200], [60, 100], [180, 220], [0.5, 0.7]),
              getRandomRGBA([200, 240], [120, 160], [220, 255], [0.4, 0.6]),
            ],
            hasMoon: Math.random() > 0.6,
            moonSize: 0.1 + Math.random() * 0.15,
            moonColor: getRandomRGBA([180, 220], [160, 200], [200, 240], [0.7, 0.9]),
            moonDistance: 1.7 + Math.random() * 0.6,
            moonSpeed: 0.001 + Math.random() * 0.001,
          },
        ]
    }

    // Create random positions that are well-distributed
    const positions = []
    const minDistance = Math.min(width, height) * 0.15 // Minimum distance between planets

    for (let i = 0; i < numPlanets; i++) {
      let x, y, tooClose
      let attempts = 0

      do {
        tooClose = false
        // Keep planets away from the very center (where buttons are)
        const centerAvoidance = Math.min(width, height) * 0.25
        const angle = Math.random() * Math.PI * 2
        const distance = centerAvoidance + Math.random() * (Math.min(width, height) * 0.4)

        x = width / 2 + Math.cos(angle) * distance
        y = height / 2 + Math.sin(angle) * distance

        // Keep within bounds
        x = Math.max(width * 0.1, Math.min(width * 0.9, x))
        y = Math.max(height * 0.1, Math.min(height * 0.9, y))

        // Check distance from other planets
        for (let j = 0; j < positions.length; j++) {
          const dx = positions[j].x - x
          const dy = positions[j].y - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minDistance) {
            tooClose = true
            break
          }
        }

        attempts++
      } while (tooClose && attempts < 50)

      if (attempts < 50) {
        positions.push({ x, y })
      }
    }

    // Limit to the number of positions we could create
    numPlanets = Math.min(numPlanets, positions.length)

    for (let i = 0; i < numPlanets; i++) {
      const planetType = planetTypes[i % planetTypes.length]

      // Vary planet sizes based on position to create depth
      // Planets at the edges are smaller to appear further away
      let sizeMultiplier = 1.0
      if (
        positions[i].x < width * 0.2 ||
        positions[i].x > width * 0.8 ||
        positions[i].y < height * 0.2 ||
        positions[i].y > height * 0.8
      ) {
        sizeMultiplier = 0.7 // Smaller planets at the edges
      }

      const radius = (Math.random() * 15 + 10) * sizeMultiplier // Planet size between 10-25px, adjusted by position
      const orbitRadius = radius * (Math.random() * 0.5 + 0.5) // Small orbit radius

      // Create planet details (craters, spots, bands, clouds)
      const details = []
      const numDetails = Math.floor(Math.random() * 6) + 4 // More details

      for (let j = 0; j < numDetails; j++) {
        const detailTypeIndex = Math.floor(Math.random() * planetType.detailTypes.length)
        const detailType = planetType.detailTypes[detailTypeIndex] as "crater" | "spot" | "band" | "cloud"
        const detailSize = radius * (Math.random() * 0.4 + 0.1)
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * (radius * 0.7)

        details.push({
          type: detailType,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: detailSize,
          color: planetType.detailColors[Math.floor(Math.random() * planetType.detailColors.length)],
          angle: detailType === "band" || detailType === "cloud" ? Math.random() * Math.PI : undefined,
          width:
            detailType === "band"
              ? radius * (Math.random() * 1.2 + 0.8)
              : detailType === "cloud"
                ? radius * (Math.random() * 0.6 + 0.3)
                : undefined,
        })
      }

      // Create the planet object
      const planet = {
        centerX: positions[i].x,
        centerY: positions[i].y,
        orbitRadius: orbitRadius,
        orbitSpeed: Math.random() * 0.0001 + 0.00005, // Very slow orbit
        orbitAngle: Math.random() * Math.PI * 2, // Random starting position
        radius: radius,
        color: planetType.color,
        hasRings: planetType.hasRings,
        ringColor: planetType.ringColor || "rgba(180, 160, 120, 0.5)",
        ringWidth: radius * (Math.random() * 0.7 + 0.5), // Ring width relative to planet size
        ringAngle: (Math.random() * Math.PI) / 6, // Slight tilt to rings
        details: details,
        // Add moon properties if the planet has a moon
        hasMoon: planetType.hasMoon || false,
        moonSize: planetType.hasMoon ? radius * (planetType.moonSize || 0.2) : 0,
        moonColor: planetType.moonColor || "rgba(200, 200, 200, 0.8)",
        moonDistance: planetType.hasMoon ? radius * (planetType.moonDistance || 1.8) : 0,
        moonSpeed: planetType.moonSpeed || 0.0015,
        moonAngle: Math.random() * Math.PI * 2,
      }

      planets.push(planet)
    }

    planetsRef.current = planets
  }

  // Initialize galaxy
  const initializeGalaxy = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current

    // Randomize galaxy position
    // Avoid center area where buttons are
    let x, y
    const centerAvoidance = Math.min(width, height) * 0.3

    do {
      x = Math.random() * width
      y = Math.random() * height
    } while (Math.abs(x - width / 2) < centerAvoidance && Math.abs(y - height / 2) < centerAvoidance)

    // Randomize galaxy colors
    const galaxyColorTheme = Math.floor(Math.random() * 5)
    let coreColor, armColor, blackHoleColor

    switch (galaxyColorTheme) {
      case 0: // Blue/white
        coreColor = {
          inner: "rgba(255, 255, 255, 0.5)",
          middle: "rgba(200, 220, 255, 0.3)",
          outer: "rgba(100, 150, 200, 0)",
        }
        armColor = {
          yellow: { hue: 220, saturation: [20, 70], lightness: [60, 80] },
          blue: { hue: 200, saturation: [50, 80], lightness: [50, 70] },
        }
        blackHoleColor = {
          disk: {
            inner: "rgba(150, 200, 255, 0.8)",
            middle: "rgba(100, 150, 200, 0.6)",
            outer: "rgba(50, 100, 150, 0.4)",
          },
        }
        break

      case 1: // Red/orange
        coreColor = {
          inner: "rgba(255, 240, 220, 0.5)",
          middle: "rgba(255, 220, 180, 0.3)",
          outer: "rgba(200, 160, 120, 0)",
        }
        armColor = {
          yellow: { hue: 30, saturation: [70, 90], lightness: [60, 80] },
          blue: { hue: 0, saturation: [60, 90], lightness: [50, 70] },
        }
        blackHoleColor = {
          disk: {
            inner: "rgba(255, 100, 50, 0.8)",
            middle: "rgba(255, 150, 50, 0.6)",
            outer: "rgba(200, 100, 50, 0.4)",
          },
        }
        break

      case 2: // Purple/pink
        coreColor = {
          inner: "rgba(255, 240, 255, 0.5)",
          middle: "rgba(240, 200, 255, 0.3)",
          outer: "rgba(200, 160, 220, 0)",
        }
        armColor = {
          yellow: { hue: 300, saturation: [50, 80], lightness: [60, 80] },
          blue: { hue: 270, saturation: [60, 90], lightness: [50, 70] },
        }
        blackHoleColor = {
          disk: {
            inner: "rgba(200, 100, 255, 0.8)",
            middle: "rgba(180, 100, 220, 0.6)",
            outer: "rgba(150, 80, 180, 0.4)",
          },
        }
        break

      case 3: // Green/teal
        coreColor = {
          inner: "rgba(240, 255, 240, 0.5)",
          middle: "rgba(200, 240, 220, 0.3)",
          outer: "rgba(160, 200, 180, 0)",
        }
        armColor = {
          yellow: { hue: 150, saturation: [50, 80], lightness: [60, 80] },
          blue: { hue: 180, saturation: [60, 90], lightness: [50, 70] },
        }
        blackHoleColor = {
          disk: {
            inner: "rgba(100, 220, 180, 0.8)",
            middle: "rgba(80, 200, 160, 0.6)",
            outer: "rgba(60, 180, 140, 0.4)",
          },
        }
        break

      default: // Classic yellow/blue
        coreColor = {
          inner: "rgba(255, 240, 220, 0.5)",
          middle: "rgba(255, 220, 180, 0.3)",
          outer: "rgba(200, 160, 120, 0)",
        }
        armColor = {
          yellow: { hue: 40, saturation: [80, 90], lightness: [70, 80] },
          blue: { hue: 210, saturation: [70, 90], lightness: [60, 70] },
        }
        blackHoleColor = {
          disk: {
            inner: "rgba(255, 100, 50, 0.9)",
            middle: "rgba(255, 150, 50, 0.7)",
            outer: "rgba(200, 100, 50, 0.5)",
          },
        }
    }

    // Calculate black hole position (center of galaxy)
    const blackHoleX = x
    const blackHoleY = y

    // Calculate sun position (in one of the spiral arms)
    const sunAngle = Math.random() * Math.PI * 2
    const sunDistance = Math.min(width, height) * (0.1 + Math.random() * 0.1)
    const sunX = x + Math.cos(sunAngle) * sunDistance
    const sunY = y + Math.sin(sunAngle) * sunDistance

    galaxyRef.current = {
      x: x,
      y: y,
      radius: Math.min(width, height) * (0.25 + Math.random() * 0.1), // Randomize galaxy size
      rotation: Math.random() * Math.PI * 2, // Random initial rotation
      rotationSpeed: 0.00003 + Math.random() * 0.00004, // Randomize rotation speed
      blackHoleX: blackHoleX,
      blackHoleY: blackHoleY,
      blackHoleRadius: 6 + Math.random() * 4, // Randomize black hole size
      sunX: sunX,
      sunY: sunY,
      sunRadius: 10 + Math.random() * 4, // Randomize sun size
      coreColor: coreColor,
      armColor: armColor,
      blackHoleColor: blackHoleColor,
    }
  }

  // Initialize center black hole (under buttons)
  const initializeCenterBlackHole = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current

    // Randomize black hole position slightly
    const x = width / 2 + (Math.random() * 40 - 20)
    const y = height / 2 + 120 + (Math.random() * 40 - 20)

    centerBlackHoleRef.current = {
      x: x,
      y: y,
      radius: 12 + Math.random() * 6, // Randomize size
      rotation: Math.random() * Math.PI * 2, // Random initial rotation
      rotationSpeed: 0.00005 + Math.random() * 0.00006, // Randomize rotation speed
    }
  }

  // Initialize constellations
  const initializeConstellations = () => {
    if (!canvasRef.current) return

    const { width, height } = canvasRef.current
    const constellations = []

    // Define constellation patterns - EXPANDED with more constellations
    const allConstellationPatterns = [
      {
        name: "Ursa Major",
        numStars: 7,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
        ],
      },
      {
        name: "Orion",
        numStars: 7,
        connections: [
          [0, 1],
          [1, 2],
          [0, 3],
          [3, 4],
          [4, 5],
          [3, 6],
        ],
      },
      {
        name: "Cassiopeia",
        numStars: 5,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
      },
      {
        name: "Lyra",
        numStars: 5,
        connections: [
          [0, 1],
          [1, 2],
          [1, 3],
          [1, 4],
        ],
      },
      {
        name: "Cygnus",
        numStars: 6,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [1, 4],
          [4, 5],
        ],
      },
      {
        name: "Perseus",
        numStars: 7,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
        ],
      },
      {
        name: "Scorpius",
        numStars: 7,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
        ],
      },
      {
        name: "Pegasus",
        numStars: 4,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
        ],
      },
      {
        name: "Andromeda",
        numStars: 5,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
      },
      {
        name: "Draco",
        numStars: 8,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 7],
        ],
      },
      {
        name: "Aquila",
        numStars: 5,
        connections: [
          [0, 1],
          [1, 2],
          [2, 3],
          [2, 4],
        ],
      },
    ]

    // Randomly select 4-7 constellations
    const numConstellations = Math.floor(Math.random() * 4) + 4
    const selectedPatterns = []

    // Shuffle and select
    const shuffledPatterns = [...allConstellationPatterns].sort(() => Math.random() - 0.5)
    for (let i = 0; i < Math.min(numConstellations, shuffledPatterns.length); i++) {
      selectedPatterns.push(shuffledPatterns[i])
    }

    // Create regions that don't overlap
    const regions = []
    const minDistance = Math.min(width, height) * 0.25

    for (let i = 0; i < selectedPatterns.length; i++) {
      let x, y, radius, tooClose
      let attempts = 0

      do {
        tooClose = false
        // Keep constellations away from the very center (where buttons are)
        const centerAvoidance = Math.min(width, height) * 0.25

        x = Math.random() * (width - 2 * centerAvoidance) + centerAvoidance
        y = Math.random() * (height - 2 * centerAvoidance) + centerAvoidance

        // Adjust position if too close to center
        if (Math.abs(x - width / 2) < centerAvoidance && Math.abs(y - height / 2) < centerAvoidance) {
          if (Math.random() > 0.5) {
            x = Math.random() > 0.5 ? centerAvoidance / 2 : width - centerAvoidance / 2
          } else {
            y = Math.random() > 0.5 ? centerAvoidance / 2 : height - centerAvoidance / 2
          }
        }

        radius = Math.min(width, height) * (0.1 + Math.random() * 0.1)

        // Check distance from other regions
        for (let j = 0; j < regions.length; j++) {
          const dx = regions[j].x - x
          const dy = regions[j].y - y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < minDistance) {
            tooClose = true
            break
          }
        }

        attempts++
      } while (tooClose && attempts < 30)

      if (attempts < 30) {
        regions.push({ x, y, radius })
      }
    }

    // Create constellations based on available regions
    for (let i = 0; i < Math.min(selectedPatterns.length, regions.length); i++) {
      const pattern = selectedPatterns[i]
      const region = regions[i]
      const stars = []

      // Create stars for this constellation
      for (let j = 0; j < pattern.numStars; j++) {
        // Create a star within the constellation region
        const angle = (j / pattern.numStars) * Math.PI * 2
        const distance = Math.random() * region.radius * 0.8
        const x = region.x + Math.cos(angle) * distance
        const y = region.y + Math.sin(angle) * distance

        stars.push({
          x: x,
          y: y,
          size: Math.random() * 1 + 1.5, // Constellation stars are slightly larger
          brightness: Math.random() * 0.3 + 0.7, // Brighter
          brightnessDelta: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        })
      }

      // Calculate name position (near the center of the constellation)
      let nameX = 0,
        nameY = 0
      stars.forEach((star) => {
        nameX += star.x
        nameY += star.y
      })
      nameX /= stars.length
      nameY /= stars.length

      // Add some offset to not overlap with stars
      nameX += 20
      nameY += 20

      // Create constellation connections
      const connections = pattern.connections.map(([from, to]) => {
        return [from, to] as [number, number]
      })

      constellations.push({
        name: pattern.name,
        stars: stars,
        connections: connections,
        nameX: nameX,
        nameY: nameY,
      })
    }

    constellationsRef.current = constellations
  }

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    // Initialize elements if not already done
    if (starsRef.current.length === 0) {
      initializeStars()
    }

    if (planetsRef.current.length === 0) {
      initializePlanets()
    }

    if (!galaxyRef.current) {
      initializeGalaxy()
    }

    if (constellationsRef.current.length === 0) {
      initializeConstellations()
    }

    if (!centerBlackHoleRef.current) {
      initializeCenterBlackHole()
    }

    if (!satelliteRef.current) {
      initializeSatellite()
    }

    if (shootingStarsRef.current === undefined) {
      initializeShootingStars()
    }

    const animate = (timestamp: number) => {
      if (!canvasRef.current) return

      // Calculate delta time for smooth animation
      const deltaTime = timestamp - (timeRef.current || timestamp)
      timeRef.current = timestamp

      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      const { width, height } = canvasRef.current

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Generate a random background gradient for this scene
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)

      // Get background colors based on the scene ID
      const bgColorSeed = Number.parseInt(sceneId.substring(0, 8), 36) % 5

      switch (bgColorSeed) {
        case 0: // Deep blue/purple
          bgGradient.addColorStop(0, "rgba(10, 5, 30, 1)")
          bgGradient.addColorStop(0.5, "rgba(20, 10, 50, 1)")
          bgGradient.addColorStop(1, "rgba(5, 15, 40, 1)")
          break
        case 1: // Dark red/purple
          bgGradient.addColorStop(0, "rgba(20, 5, 20, 1)")
          bgGradient.addColorStop(0.5, "rgba(30, 10, 30, 1)")
          bgGradient.addColorStop(1, "rgba(20, 5, 25, 1)")
          break
        case 2: // Dark green/blue
          bgGradient.addColorStop(0, "rgba(5, 15, 20, 1)")
          bgGradient.addColorStop(0.5, "rgba(10, 20, 30, 1)")
          bgGradient.addColorStop(1, "rgba(5, 10, 25, 1)")
          break
        case 3: // Dark teal/blue
          bgGradient.addColorStop(0, "rgba(5, 15, 25, 1)")
          bgGradient.addColorStop(0.5, "rgba(10, 25, 35, 1)")
          bgGradient.addColorStop(1, "rgba(5, 20, 30, 1)")
          break
        default: // Classic dark blue
          bgGradient.addColorStop(0, "rgba(10, 5, 20, 1)")
          bgGradient.addColorStop(0.5, "rgba(20, 10, 40, 1)")
          bgGradient.addColorStop(1, "rgba(5, 10, 30, 1)")
      }

      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Draw galaxy
      if (galaxyRef.current) {
        const galaxy = galaxyRef.current
        galaxy.rotation += galaxy.rotationSpeed * deltaTime

        // Draw galaxy dust lanes first (darker areas)
        const numDustLanes = 5 // More dust lanes for realism
        ctx.globalAlpha = 0.4

        for (let lane = 0; lane < numDustLanes; lane++) {
          const laneAngleOffset = ((Math.PI * 2) / numDustLanes) * lane
          const laneWidth = galaxy.radius * (0.1 + lane * 0.05)

          ctx.beginPath()
          ctx.arc(
            galaxy.x,
            galaxy.y,
            galaxy.radius * (0.4 + lane * 0.15),
            laneAngleOffset + galaxy.rotation,
            laneAngleOffset + galaxy.rotation + Math.PI * 1.2,
            false,
          )
          ctx.lineWidth = laneWidth
          ctx.strokeStyle = "rgba(5, 5, 15, 0.8)" // Darker dust lanes
          ctx.stroke()
        }

        ctx.globalAlpha = 1.0

        // Draw galaxy spiral arms with increased density and realism
        const numArms = 2
        const numPointsPerArm = 450 // Increased density for more realism

        for (let arm = 0; arm < numArms; arm++) {
          const armAngleOffset = ((Math.PI * 2) / numArms) * arm

          for (let i = 0; i < numPointsPerArm; i++) {
            const distance = (i / numPointsPerArm) * galaxy.radius
            // Logarithmic spiral formula with slight randomness
            const b = 0.2 + Math.random() * 0.02 - 0.01 // Slight variation in spiral tightness
            const angle = galaxy.rotation + armAngleOffset + b * Math.log(distance / 10)

            // Add slight random variation to position for more natural look
            const randomOffset = (Math.random() * 0.1 * distance) / galaxy.radius
            const x = galaxy.x + Math.cos(angle) * distance + (Math.random() - 0.5) * randomOffset * distance
            const y = galaxy.y + Math.sin(angle) * distance + (Math.random() - 0.5) * randomOffset * distance

            // Vary size based on position in arm with slight randomness
            const sizeFactor = 1 - (i / numPointsPerArm) * 0.5
            const size = (Math.random() * 2 + 0.8) * sizeFactor

            // Vary opacity based on position in arm with density variations
            const opacityBase = 0.1 + (i / numPointsPerArm) * 0.15
            const opacity = opacityBase * (0.5 + Math.random() * 0.5) * (Math.random() > 0.2 ? 1 : 0.5)

            // More realistic color distribution
            let hue, saturation, lightness

            // Create more realistic star color distribution
            const colorRoll = Math.random()
            if (colorRoll > 0.92) {
              // Red giants (rare)
              hue = 0 + Math.random() * 20
              saturation = 80 + Math.random() * 20
              lightness = 70 + Math.random() * 20
            } else if (colorRoll > 0.85) {
              // Yellowish stars
              hue = 40 + Math.random() * 20
              saturation = 80 + Math.random() * 20
              lightness = 70 + Math.random() * 20
            } else if (colorRoll > 0.7) {
              // Bluish stars
              hue = 200 + Math.random() * 40
              saturation = 70 + Math.random() * 30
              lightness = 60 + Math.random() * 30
            } else {
              // White/neutral stars (most common)
              hue = 200 + Math.random() * 60
              saturation = 20 + Math.random() * 30
              lightness = 80 + Math.random() * 20
            }

            ctx.beginPath()
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Draw black hole with more realistic accretion disk
        // First draw accretion disk
        const accretionGradient = ctx.createRadialGradient(
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          galaxy.blackHoleRadius,
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          galaxy.blackHoleRadius * 5,
        )
        accretionGradient.addColorStop(0, galaxy.blackHoleColor.disk.inner)
        accretionGradient.addColorStop(0.2, galaxy.blackHoleColor.disk.middle)
        accretionGradient.addColorStop(0.4, galaxy.blackHoleColor.disk.outer)
        accretionGradient.addColorStop(1, "rgba(100, 50, 30, 0)")

        ctx.save()
        ctx.translate(galaxy.blackHoleX, galaxy.blackHoleY)
        ctx.rotate(galaxy.rotation * 2)
        ctx.scale(1, 0.3) // Flatten to create disk

        ctx.beginPath()
        ctx.fillStyle = accretionGradient
        ctx.arc(0, 0, galaxy.blackHoleRadius * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Then draw black hole itself with improved event horizon
        ctx.beginPath()
        const eventHorizonGradient = ctx.createRadialGradient(
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          0,
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          galaxy.blackHoleRadius,
        )
        eventHorizonGradient.addColorStop(0, "rgba(0, 0, 0, 1)")
        eventHorizonGradient.addColorStop(0.7, "rgba(20, 10, 30, 0.9)")
        eventHorizonGradient.addColorStop(1, "rgba(0, 0, 0, 1)")

        ctx.fillStyle = eventHorizonGradient
        ctx.arc(galaxy.blackHoleX, galaxy.blackHoleY, galaxy.blackHoleRadius, 0, Math.PI * 2)
        ctx.fill()

        // Add improved light bending effect around black hole
        const bendingGradient = ctx.createRadialGradient(
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          galaxy.blackHoleRadius,
          galaxy.blackHoleX,
          galaxy.blackHoleY,
          galaxy.blackHoleRadius * 2.5,
        )
        bendingGradient.addColorStop(0, "rgba(0, 0, 0, 0.9)")
        bendingGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.5)")
        bendingGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.fillStyle = bendingGradient
        ctx.arc(galaxy.blackHoleX, galaxy.blackHoleY, galaxy.blackHoleRadius * 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Draw sun with improved glow
        const sunGradient = ctx.createRadialGradient(
          galaxy.sunX,
          galaxy.sunY,
          0,
          galaxy.sunX,
          galaxy.sunY,
          galaxy.sunRadius * 4,
        )
        sunGradient.addColorStop(0, "rgba(255, 255, 220, 1)")
        sunGradient.addColorStop(0.2, "rgba(255, 220, 100, 0.8)")
        sunGradient.addColorStop(0.4, "rgba(255, 180, 50, 0.5)")
        sunGradient.addColorStop(0.7, "rgba(255, 100, 50, 0.3)")
        sunGradient.addColorStop(1, "rgba(255, 50, 0, 0)")

        ctx.beginPath()
        ctx.fillStyle = sunGradient
        ctx.arc(galaxy.sunX, galaxy.sunY, galaxy.sunRadius * 4, 0, Math.PI * 2)
        ctx.fill()

        // Add solar flares
        const numFlares = 5
        for (let i = 0; i < numFlares; i++) {
          const flareAngle = Math.random() * Math.PI * 2
          const flareLength = galaxy.sunRadius * (Math.random() * 0.5 + 0.5)

          ctx.beginPath()
          ctx.moveTo(galaxy.sunX, galaxy.sunY)

          // Create curved flare
          const cp1x = galaxy.sunX + Math.cos(flareAngle) * galaxy.sunRadius * 1.2
          const cp1y = galaxy.sunY + Math.sin(flareAngle) * galaxy.sunRadius * 1.2
          const cp2x = galaxy.sunX + Math.cos(flareAngle) * galaxy.sunRadius * 1.5
          const cp2y = galaxy.sunY + Math.sin(flareAngle) * galaxy.sunRadius * 1.5
          const endX = galaxy.sunX + Math.cos(flareAngle) * (galaxy.sunRadius + flareLength)
          const endY = galaxy.sunY + Math.sin(flareAngle) * (galaxy.sunRadius + flareLength)

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)

          const flareGradient = ctx.createLinearGradient(galaxy.sunX, galaxy.sunY, endX, endY)
          flareGradient.addColorStop(0, "rgba(255, 255, 220, 0.7)")
          flareGradient.addColorStop(1, "rgba(255, 100, 0, 0)")

          ctx.strokeStyle = flareGradient
          ctx.lineWidth = galaxy.sunRadius * (Math.random() * 0.2 + 0.1)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.fillStyle = "rgba(255, 255, 220, 1)"
        ctx.arc(galaxy.sunX, galaxy.sunY, galaxy.sunRadius, 0, Math.PI * 2)
        ctx.fill()

        // Add improved galaxy core glow
        const coreGradient = ctx.createRadialGradient(galaxy.x, galaxy.y, 0, galaxy.x, galaxy.y, galaxy.radius * 0.3)
        coreGradient.addColorStop(0, galaxy.coreColor.inner)
        coreGradient.addColorStop(1, galaxy.coreColor.outer)

        ctx.beginPath()
        ctx.fillStyle = coreGradient
        ctx.arc(galaxy.x, galaxy.y, galaxy.radius * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw stars
      if (starsRef.current) {
        starsRef.current.forEach((star) => {
          // Twinkle effect
          star.brightness += star.brightnessDelta * deltaTime * 0.02
          if (star.brightness > 1) {
            star.brightnessDelta *= -1
            star.brightness = 1
          } else if (star.brightness < 0.4) {
            star.brightnessDelta *= -1
            star.brightness = 0.4
          }

          ctx.beginPath()
          ctx.fillStyle = `rgba(${star.color}, ${star.brightness})`
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Draw constellations
      if (constellationsRef.current) {
        constellationsRef.current.forEach((constellation) => {
          // Draw connections
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = 1.5

          constellation.connections.forEach(([from, to]) => {
            ctx.beginPath()
            ctx.moveTo(constellation.stars[from].x, constellation.stars[from].y)
            ctx.lineTo(constellation.stars[to].x, constellation.stars[to].y)
            ctx.stroke()
          })

          // Draw constellation names
          ctx.fillStyle = "rgba(200, 220, 255, 0.6)"
          ctx.font = "14px sans-serif"
          ctx.fillText(constellation.name, constellation.nameX, constellation.nameY)
        })
      }

      // Draw planets
      if (planetsRef.current) {
        planetsRef.current.forEach((planet) => {
          // Update planet orbit angle
          planet.orbitAngle += planet.orbitSpeed * deltaTime

          // Calculate planet position
          const x = planet.centerX + Math.cos(planet.orbitAngle) * planet.orbitRadius
          const y = planet.centerY + Math.sin(planet.orbitAngle) * planet.orbitRadius

          // Draw planet
          ctx.beginPath()
          ctx.fillStyle = planet.color
          ctx.arc(x, y, planet.radius, 0, Math.PI * 2)
          ctx.fill()

          // Draw planet details (craters, spots, bands, clouds)
          planet.details.forEach((detail) => {
            ctx.save()
            ctx.translate(x + detail.x, y + detail.y)

            if (detail.type === "band" || detail.type === "cloud") {
              ctx.rotate(detail.angle || 0)
            }

            ctx.fillStyle = detail.color

            if (detail.type === "crater") {
              // Draw crater as a circle with a darker edge
              ctx.beginPath()
              ctx.arc(0, 0, detail.size, 0, Math.PI * 2)
              ctx.fill()
              ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
              ctx.lineWidth = detail.size / 5
              ctx.stroke()
            } else if (detail.type === "spot") {
              // Draw spot as a simple circle
              ctx.beginPath()
              ctx.arc(0, 0, detail.size, 0, Math.PI * 2)
              ctx.fill()
            } else if (detail.type === "band") {
              // Draw band as a rectangle
              ctx.fillRect(-detail.width! / 2, -detail.size / 2, detail.width!, detail.size)
            } else if (detail.type === "cloud") {
              // Draw cloud as a soft-edged rectangle
              ctx.globalAlpha = 0.7
              ctx.fillRect(-detail.width! / 2, -detail.size / 2, detail.width!, detail.size)
              ctx.globalAlpha = 1
            }

            ctx.restore()
          })

          // Draw planet rings
          if (planet.hasRings) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(planet.ringAngle)

            // Draw rings as a flattened ellipse
            ctx.beginPath()
            ctx.ellipse(0, 0, planet.radius + planet.ringWidth, planet.radius * 0.7, 0, 0, Math.PI * 2)
            ctx.fillStyle = planet.ringColor
            ctx.fill()
            ctx.restore()
          }

          // Draw moon
          if (planet.hasMoon) {
            // Update moon orbit angle
            planet.moonAngle += planet.moonSpeed * deltaTime

            // Calculate moon position
            const moonX = x + Math.cos(planet.moonAngle) * planet.radius * planet.moonDistance
            const moonY = y + Math.sin(planet.moonAngle) * planet.radius * planet.moonDistance

            // Draw moon
            ctx.beginPath()
            ctx.fillStyle = planet.moonColor
            ctx.arc(moonX, moonY, planet.moonSize, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      }

      // Draw satellite
      if (satelliteRef.current) {
        const satellite = satelliteRef.current

        // Update satellite orbit angle
        satellite.orbitAngle += satellite.orbitSpeed * deltaTime

        // Calculate satellite position
        const x = satellite.centerX + Math.cos(satellite.orbitAngle) * satellite.orbitRadius
        const y = satellite.centerY + Math.sin(satellite.orbitAngle) * satellite.orbitRadius

        // Draw satellite body
        ctx.beginPath()
        ctx.fillStyle = "rgba(180, 180, 180, 0.8)"
        ctx.arc(x, y, satellite.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw solar panels
        ctx.fillStyle = "rgba(50, 50, 50, 0.9)"
        ctx.fillRect(x - satellite.size * 1.5, y - satellite.size * 0.3, satellite.size * 3, satellite.size * 0.6)
      }

      // Draw shooting stars
      if (shootingStarsRef.current) {
        // Create shooting stars periodically
        shootingStarTimerRef.current += deltaTime
        if (shootingStarTimerRef.current > 1500 + Math.random() * 1000) {
          createShootingStar()
          shootingStarTimerRef.current = 0
        }

        shootingStarsRef.current.forEach((star, index) => {
          if (!star.active) return

          // Update progress
          star.progress += star.speed * deltaTime
          if (star.progress >= 1) {
            star.active = false
            return
          }

          // Calculate current position
          const x = star.x + (star.endX - star.x) * star.progress
          const y = star.y + (star.endY - star.y) * star.progress

          // Draw trail
          ctx.beginPath()
          ctx.moveTo(x, y)

          // Calculate trail end point
          const trailEndX = x - (star.endX - star.x) * Math.min(star.progress, star.length / 100)
          const trailEndY = y - (star.endY - star.y) * Math.min(star.progress, star.length / 100)

          ctx.lineTo(trailEndX, trailEndY)

          // Set trail style
          ctx.lineWidth = 2
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * (1 - star.progress)})`
          ctx.stroke()
        })

        // Remove inactive shooting stars
        shootingStarsRef.current = shootingStarsRef.current.filter((star) => star.active)
      }

      // Draw center black hole (under buttons)
      if (centerBlackHoleRef.current) {
        const blackHole = centerBlackHoleRef.current
        blackHole.rotation += blackHole.rotationSpeed * deltaTime

        // Draw black hole
        ctx.save()
        ctx.translate(blackHole.x, blackHole.y)
        ctx.rotate(blackHole.rotation)

        // Create gradient for event horizon
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blackHole.radius)
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)")
        gradient.addColorStop(1, "rgba(50, 50, 50, 0.8)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(0, 0, blackHole.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(requestRef.current!)
  }, [dimensions, sceneId])

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Interactive background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-12 tracking-tight relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            FALLEN FURS
          </span>
        </h1>

        <div className="grid grid-cols-1 gap-5 max-w-md mx-auto w-full">
          <a href="https://vrchat.com/home/group/grp_2c51f675-5c99-4da9-a6f7-2cfb5440bbac" target="_blank" rel="noopener noreferrer" className="w-full">
            <button
              className="h-14 text-lg font-medium text-white w-full relative overflow-hidden border-opacity-40
            bg-gradient-to-br from-blue-950/80 via-indigo-950/80 to-violet-950/80 border border-blue-400
            hover:shadow-[0_0_25px_rgba(96,165,250,0.5)] hover:border-blue-300 transition-all duration-300 rounded-md"
            >
              <span className="relative z-10">Our VRC Group!</span>
            </button>
          </a>

          <a href="https://discord.com/invite/x6SVAjEtD4" target="_blank" rel="noopener noreferrer" className="w-full">
            <button
              className="h-14 text-lg font-medium text-white w-full relative overflow-hidden border-opacity-40
            bg-gradient-to-br from-blue-950/80 via-indigo-950/80 to-violet-950/80 border border-blue-400
            hover:shadow-[0_0_25px_rgba(96,165,250,0.5)] hover:border-blue-300 transition-all duration-300 rounded-md"
            >
              <span className="relative z-10">Discord</span>
            </button>
          </a>

          <a href="https://www.tiktok.com/@fallenfurs" target="_blank" rel="noopener noreferrer" className="w-full">
            <button
              className="h-14 text-lg font-medium text-white w-full relative overflow-hidden border-opacity-40
            bg-gradient-to-br from-fuchsia-950/80 via-purple-950/80 to-pink-950/80 border border-fuchsia-400
            hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] hover:border-fuchsia-300 transition-all duration-300 rounded-md"
            >
              <span className="relative z-10">Tiktok</span>
            </button>
          </a>

          <a href="https://instagram.com/fallenfurs" target="_blank" rel="noopener noreferrer" className="w-full">
            <button
              className="h-14 text-lg font-medium text-white w-full relative overflow-hidden border-opacity-40
          bg-gradient-to-br from-pink-950/80 via-purple-950/80 to-amber-950/80 border border-pink-400
          hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:border-pink-300 transition-all duration-300 rounded-md"
            >
              <span className="relative z-10">Instagram</span>
            </button>
          </a>

          <a href="https://x.com/FallenFurs" target="_blank" rel="noopener noreferrer" className="w-full">
            <button
              className="h-14 text-lg font-medium text-white w-full relative overflow-hidden border-opacity-40
            bg-gradient-to-br from-cyan-950/80 via-blue-950/80 to-indigo-950/80 border border-cyan-400
            hover:shadow-[0_0_25px_rgba(103,232,249,0.5)] hover:border-cyan-300 transition-all duration-300 rounded-md"
            >
              <span className="relative z-10">Follow Us On X</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
