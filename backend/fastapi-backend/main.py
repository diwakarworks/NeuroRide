import logging
from fastapi import FastAPI, Query, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import json
import requests
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from math import radians, sin, cos, sqrt, atan2
from typing import Dict, Any
import asyncio
import random



logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def load_rides():
    with open("data/rides.json", "r") as file:
        return json.load(file)

# Load drivers from JSON

with open("data/drivers.json", "r") as file:
    drivers = json.load(file)

# Store real-time driver locations
driver_locations: Dict[str, Dict[str, float]] = {}

# Active WebSocket connections
active_drivers: Dict[str, WebSocket] = {}

class LocationUpdate(BaseModel):
    driver_id: str
    latitude: float
    longitude: float

# ----------------------- Utility Functions -----------------------

def geocode_location(location: str):
    """Convert an address into latitude & longitude using Google Maps API."""
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={GOOGLE_MAPS_API_KEY}"
    response = requests.get(url).json()
    try:
        lat = response["results"][0]["geometry"]["location"]["lat"]
        lng = response["results"][0]["geometry"]["location"]["lng"]
        return lat, lng
    except (KeyError, IndexError):
        raise HTTPException(status_code=400, detail=f"Invalid location: {location}")

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance using the Haversine formula."""
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c  # Distance in km

# ----------------------- API Endpoints -----------------------

@app.get("/find-drivers")
def get_drivers(
    pickup: str = Query(..., description="Pickup location"),
    dropoff: str = Query(..., description="Dropoff location"),
):
    """Finds the 5 nearest drivers based on pickup location using Haversine distance."""
    pickup_lat, pickup_lng = geocode_location(pickup)
    geocode_location(dropoff)  # Ensuring dropoff is valid but not using it

    valid_drivers = [driver for driver in drivers if "latitude" in driver and "longitude" in driver]
    
    for driver in valid_drivers:
        driver["distance_km"] = haversine_distance(pickup_lat, pickup_lng, driver["latitude"], driver["longitude"])
    
    sorted_drivers = sorted(valid_drivers, key=lambda x: x["distance_km"])[:5]
    return {"drivers": sorted_drivers}

@app.websocket("/ws/track/{driver_id}")
async def track_driver(websocket: WebSocket, driver_id: str):
    """WebSocket for real-time driver location tracking."""
    await websocket.accept()
    print(f"Driver {driver_id} connected.")
    active_drivers[driver_id] = websocket  
    print(f"Active Drivers: {list(active_drivers.keys())}") 
    print(f"Expected driver ID: {driver_id}, Available: {list(driver_locations.keys())}")
 
    try:
        while True:
            raw_data = await websocket.receive_text()
            print(f"Raw WebSocket Data: {raw_data}")  # Debugging Step
            
            try:
                data = json.loads(raw_data.strip())  # Ensure it's valid JSON
                driver_locations[driver_id] = {
                    "driver_id": driver_id,
                    "latitude": data["latitude"],
                    "longitude": data["longitude"],
                }
                print(f"Processed Location: {driver_locations[driver_id]}")

                # Broadcast the updated location
                await websocket.send_json(driver_locations[driver_id])
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")  # Debugging Step

            await asyncio.sleep(30)
    except WebSocketDisconnect:
        print(f"Driver {driver_id} disconnected.")
        active_drivers.pop(driver_id, None)
        driver_locations.pop(driver_id, None)

@app.get("/driver-location/{driver_id}")
def get_driver_location(driver_id: str):
    """Fetch the latest location of a driver."""
    
    # Check if the driver has an active location update
    if driver_id in driver_locations:
        return {
            "driver_id": driver_id,
            "location": driver_locations[driver_id],
        }
    
    # If not found in real-time locations, check in the static drivers.json data
    for driver in drivers:
        if driver.get("_id") == driver_id:
            return {
                "driver_id": driver_id,
                "location": {
                    "latitude": driver["latitude"],
                    "longitude": driver["longitude"],
                }
            }
    
    # If the driver is not found in both sources
    raise HTTPException(status_code=404, detail="Driver not found or not active.")


@app.get("/ride/{ride_id}/driver-location")
def get_driver_location(ride_id: str):
    rides = load_rides()
    print("Received ride_id:", ride_id)
    print("Rides Data:", rides)  # Check structure

    ride = next((r for r in rides if str(r.get("rideId")) == ride_id), None)


    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    driver_id = ride["driverId"]
    
    # Fetch driver details from data.json
    driver = next((d for d in drivers if d["_id"] == driver_id), None)

    if not driver:
        raise HTTPException(status_code=404, detail="Driver location not available")

    return {
        "driverId": driver_id,
        "location": {
            "latitude": driver["latitude"],
            "longitude": driver["longitude"]
        }
    }



@app.post("/api/driver/update-location")
async def update_driver_location(location: LocationUpdate):
    logging.info(f"Updating location for {location.driver_id}: {location.latitude}, {location.longitude}")
    """Update driver location dynamically"""
    
    if location.driver_id not in driver_locations:
        driver_locations[location.driver_id] = {}

    driver_locations[location.driver_id] = {
        "latitude": location.latitude,
        "longitude": location.longitude,
    }
    

    return {"message": "Location updated", "location": driver_locations[location.driver_id]}

# ----------------------- Simulate Driver Movement -----------------------

async def simulate_driver_movement():
    """Simulates driver movement by randomly updating their locations."""
    while True:
        for driver in drivers:
            driver_id = driver.get("_id")
            if driver_id:
                # Small random movement
                new_lat = driver["latitude"] + random.uniform(-0.0035, 0.0035)
                new_lon = driver["longitude"] + random.uniform(-0.0035, 0.0035)

                # Update stored location
                driver_locations[driver_id] = {
                    "driver_id": driver_id,
                    "latitude": new_lat,
                    "longitude": new_lon,
                }

                # Send updates to WebSocket clients
                if driver_id in active_drivers:
                    websocket = active_drivers[driver_id]
                    await websocket.send_json(driver_locations[driver_id])

        await asyncio.sleep(60)  

async def simulate_ride_movement():
    """Simulates ride movement towards the destination."""
    print("🚀 simulate_ride_movement() started!")  # Debugging statement

    while True:
        print("🔄 Checking rides...")
        rides = load_rides()  # Reload fresh rides in every loop

        for ride in rides:
            print(f"🚗 Processing ride: {ride}")  # Show ride data before updating

            ride_id = ride["rideId"]
            driver_id = ride["driverId"]

            # Fetch the driver's current location
            driver_location = driver_locations.get(driver_id)

            if not driver_location:
                print(f"⚠️ No location found for driver {driver_id}, skipping...")
                continue  

            current_lat = driver_location["latitude"]
            current_lon = driver_location["longitude"]

            # Move ride slightly
            new_lat = current_lat + random.uniform(-0.002, 0.002)
            new_lon = current_lon + random.uniform(-0.002, 0.002)

            # Update the ride location
            ride["current_lat"] = new_lat
            ride["current_lon"] = new_lon

            print(f"✅ Ride {ride_id} moved to: ({new_lat}, {new_lon})")

            update_data = {
                "rideId": ride_id,
                "driverId": driver_id,
                "latitude": new_lat,
                "longitude": new_lon
            }

            # ✅ Fix: Check if driver has an active WebSocket connection
            websocket = active_drivers.get(driver_id)
            if websocket:
                try:
                    print("Sending WebSocket data:", update_data)  # Debugging print
                    await websocket.send_json(update_data)
                    print("Data sent successfully")  # Confirm it was executed

                
                except Exception as e:
                    print(f"❌ Error sending WebSocket data: {e}")
            else:
                print(f"🚫 No active WebSocket for driver {driver_id}, skipping send.")

        await asyncio.sleep(10)  # Adjusted for quick updates


# Run the simulation in the background
@app.on_event("startup")
async def start_simulation():
    await asyncio.sleep(5) 
    asyncio.create_task(simulate_driver_movement())
    asyncio.create_task(simulate_ride_movement()) 


