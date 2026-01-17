# Hospital Ambulance Tracker

A real-time geospatial dashboard designed to track ambulances and optimize hospital response times across Nigeria. Built with **Next.js 15**, **TanStack Query (React Query)**, and **MapLibre GL**.

## 🏗 Architecture Overview

The application follows a modern, decoupled architecture designed for high-performance geospatial tracking:

### 1. Core Technology Stack

- **Framework**: Next.js 15 (App Router) for hybrid rendering and optimized routing.
- **State Management**: **TanStack Query (v5)** manages all server-synchronized state. This eliminates complex local state logic and handles caching, background refetching, and optimistic updates out of the box.
- **Mapping Engine**: **MapLibre GL** for vector-based map rendering with custom layers and markers.
- **Spatial Logic**: **Turf.js** on the server for accurate great-circle distance calculations.

### 2. Implementation Layers

- **UI & Visualization**: Responsive dashboard built with Tailwind CSS, featuring glassmorphism and smooth micro-animations.
- **API Client Layer**: A type-safe API client built on Axios that uses **Transformers** to map backend formats (e.g., flat latitude/longitude) to the internal domain model (e.g., nested `coordinates` objects).
- **In-Memory Backend**: A thread-safe API store that simulates a real-time database, tracking ambulance positions and statuses across sessions.

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Setup Instructions

1. **Clone and Install**:
   ```bash
   git clone https://github.com/Drbenzene/dycovue_frontend.git
   cd hospital-tracker
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 🛠 Features

- **Real-time Tracker**: Monitor ambulance fleet status (Available, Busy, En Route, Offline).
- **Intelligent Dispatch**: Auto-calculates the nearest ambulance to any selected hospital using server-side geospatial queries.
- **Live Animations**: High-fidelity visual interpolation for ambulance journeys and real-time bearing (heading) updates.

---

## 📝 Learning Log: Mapping & Real-time Animation Challenges

### The Challenge: Smooth Real-time Tracking

The most complex part of this project was implementing a system that felt "alive." Initially, ambulances simply "snapped" to their new coordinates when the server updated. In a high-speed emergency scenario, this looked jittery and unprofessional.

### Research & Logic Implementation

1. **Visual Interpolation**: I researched how to decouple the "Server State" from the "Visual State." While the server only knows a start and end point, the frontend needs to render 60 frames per second of movement to look smooth.
2. **Path Calculation**: I implemented a linear interpolation (LERP) algorithm combined with path segmentation. Instead of just moving an icon, the system calculates a 100-point path between objects and moves the marker along that path at a speed proportional to the estimated travel time.
3. **Dynamic Bearing**: A standard map marker stays upright. To make the tracker realistic, I implemented a `calculateBearing` function that uses the Haversine formula to determine the heading of the ambulance between any two path segments, ensuring the vehicle icon always "looks" where it's driving.

### The Mapping Provider Hurdle

Another challenge was finding a reliable, high-performance map provider that worked in production without restrictive API keys. I transitioned from a proprietary MapTiler style to the Open-Source **CartoDB Voyager** style. This required re-synchronizing the coordinate systems and ensuring the vector tile layers correctly handled our custom Hospital and Ambulance markers without overlapping labels.

### Key Takeaway

Real-time geospatial apps are as much about "Visual Deception" (smooth interpolation) as they are about "Data Accuracy" (API fetching). By separating the animation loop from the React Query refetch loop, I achieved a UI that feels responsive and fluid even when network latency varies.