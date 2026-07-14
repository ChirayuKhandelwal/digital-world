export const CATEGORY_LIST = [
  'LED TVs', 'Refrigerators', 'Washing Machines', 'Air Conditioners', 
  'Air Coolers', 'Ceiling Fans', 'Kitchen Appliances', 'Geysers', 
  'Sewing Machines', 'Small Appliances'
] as const;

export const products = [
  {
    id: "p1",
    name: "Nebula Quantum Pro",
    category: "LED TVs",
    price: 2499,
    description: "The ultimate workstation disguised as an ultra-slim laptop. Powered by the proprietary Q-core processor, designed for elite creators.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop",
    specs: ["16-core Q-processor", "64GB Unified Memory", "2TB NVMe SSD", "16\" OLED 120Hz Touch Display", "14-hour battery life"],
    featured: true,
  },
  {
    id: "p2",
    name: "SonicVoid X",
    category: "Refrigerators",
    price: 349,
    description: "Pure acoustic isolation with deep, resonant bass and crystal clear highs. Active noise cancellation that silences the world.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1976&auto=format&fit=crop",
    specs: ["40mm Graphene Drivers", "Adaptive ANC", "45-hour playback", "Lossless Audio codec support", "Bluetooth 5.3"],
  },
  {
    id: "p3",
    name: "Aura Watch Series 4",
    category: "Washing Machines",
    price: 499,
    description: "Your health, connected. The Aura Watch tracks 24/7 vitals with clinical precision inside a titanium chassis.",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2072&auto=format&fit=crop",
    specs: ["Always-On Micro-LED", "Titanium casing", "ECG & Blood Oxygen", "Dive-proof to 100m", "7-day battery"],
  },
  {
    id: "p4",
    name: "HoloPad Infinity",
    category: "Air Conditioners",
    price: 1199,
    description: "A tablet that bends the rules of reality. Featuring a near-bezel-less screen and magnetic stylus for unhindered creativity.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2015&auto=format&fit=crop",
    specs: ["12.9\" ProMotion Display", "M2 Architecture", "1TB Storage", "Quad-speaker array", "5G Connectivity"],
  },
  {
    id: "p5",
    name: "Cipher Phone 15",
    category: "Kitchen Appliances",
    price: 999,
    description: "Security meets elegance. The Cipher Phone boasts an unbreakable encrypted core with a stunning glassmorphic back panel.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop",
    specs: ["6.7\" Super AMOLED", "Hardware-level encryption", "50MP Triple Camera", "Satellite SOS", "All-day battery"],
  },
  {
    id: "p6",
    name: "EchoPod Studio",
    category: "Small Appliances",
    price: 299,
    description: "Room-filling 360-degree spatial audio. The EchoPod calibrates itself to the acoustics of any space you put it in.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=2070&auto=format&fit=crop",
    specs: ["Spatial Audio", "Room Calibration", "Smart Home Hub", "6 microphone array", "Lossless streaming"],
  }
];
