import Dexie from "dexie";
import { getDistance } from "geolib";

export const db = new Dexie("HikeTrackerDB");

db.version(5).stores({
    hikes: "++id, startTime, endTime, duration, distance",
    locations: "++id, hikeId, latitude, longitude, timestamp",
    photos: "++id, hikeId, latitude, longitude, timestamp, imageData",
});

export const createNewHike = async () => {
    // Add new hike to db and get the id back to use to track hike locations and photos
    const id = await db.hikes.add({
        startTime: new Date().toISOString(),
        endTime: null,
        distance: 0,
    });
    return id;
};

export const endHike = async (id) => {
    const locations = await getLocationsForHike(id);
    const hike = await db.hikes.get(id);


    // Calculate distance travelled
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
        totalDistance += getDistance(
            {
                latitude: locations[i - 1].latitude,
                longitude: locations[i - 1].longitude,
            },
            {
                latitude: locations[i].latitude,
                longitude: locations[i].longitude,
            }
        );
    }
    
    // Calculate duration
    const startTime = new Date(hike.startTime);
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const duration = formatDuration(durationMs);

    // Save to DB
    await db.hikes.update(id, {
        endTime: endTime.toISOString(),
        distance: totalDistance,
        duration: duration,
    });
};

export const saveLocationData = async (hikeId, data) => {
    await db.locations.add({ ...data, hikeId });
};

export const getAllHikes = async () => {
    return await db.hikes.toArray();
};

export const getLocationsForHike = async (hikeId) => {
    return await db.locations.where({ hikeId }).toArray();
};

export const savePhoto = async ({ hikeId, latitude, longitude, imageData }) => {
    await db.photos.add({
        hikeId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        imageData,
    });
};

export const getPhotosForHike = async (hikeId) => {
    return await db.photos.where({ hikeId }).toArray();
};

const formatDuration = (durationMs) => {
    const totalSeconds = Math.floor(durationMs / (1000));

    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} min${
            minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
    } else if (minutes > 0) {
        return `${minutes} min${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
    } else {
        return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
};