// Mock data for street view proximity metrics

export const getMockProximityData = () => ({
  walkabilityScore: Math.floor(Math.random() * 30) + 60,
  amenities: [
    {
      type: 'mrt',
      name: 'Nearest MRT Station',
      distance: Math.floor(Math.random() * 800) + 200
    },
    {
      type: 'bus',
      name: 'Bus Stop',
      distance: Math.floor(Math.random() * 200) + 50
    },
    {
      type: 'hawker',
      name: 'Hawker Centre',
      distance: Math.floor(Math.random() * 500) + 100
    },
    {
      type: 'park',
      name: 'Neighborhood Park',
      distance: Math.floor(Math.random() * 400) + 100
    },
    {
      type: 'mall',
      name: 'Shopping Mall',
      distance: Math.floor(Math.random() * 1000) + 300
    },
    {
      type: 'school',
      name: 'Primary School',
      distance: Math.floor(Math.random() * 600) + 200
    },
  ]
});

export const getMockStreetInsights = () => ({
  observation: "This location shows typical characteristics of a mature Singapore residential estate with established infrastructure and amenities within reasonable walking distance. The area demonstrates good urban planning with mixed-use development patterns.",
  strengths: [
    "Good public transport connectivity with multiple bus services",
    "Multiple food and retail options within walking distance",
    "Established pedestrian pathways with good lighting",
    "Proximity to green spaces for recreation"
  ],
  concerns: [
    "Some walkways lack adequate shelter coverage from rain and sun",
    "Limited dedicated cycling infrastructure in the area",
    "Street-level greenery could be improved for better heat mitigation",
    "Pedestrian crossing distances at some junctions are long"
  ],
  suggestions: [
    "Add covered linkways connecting residential blocks to MRT station",
    "Install more shaded seating areas along main pedestrian routes",
    "Implement dedicated cycling paths connecting to park connectors",
    "Increase tree planting along main roads for urban cooling"
  ]
});
