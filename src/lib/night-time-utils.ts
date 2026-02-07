import { SelectedAirport } from "@/types/logs";

interface SunTimes {
	sunrise: Date;
	sunset: Date;
}

/**
 * Get sunrise and sunset times for a specific location and date
 */
async function getSunTimes(
	lat: number,
	lon: number,
	date: Date,
): Promise<SunTimes | null> {
	// const formattedDate = date.toISOString().split("T")[0];
	const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch sun times: ${response.status}`);
		}

		const data = await response.json();
		if (data.status !== "OK") {
			throw new Error("Invalid response from sunrise-sunset API");
		}

		return {
			sunrise: new Date(data.results.sunrise),
			sunset: new Date(data.results.sunset),
		};
	} catch (err) {
		console.error("Error fetching sun times:", err);
		return null;
	}
}

/**
 * Determine if a specific time is during night hours
 * @param time - The time to check
 * @param sunrise - Sunrise time
 * @param sunset - Sunset time
 * @returns true if the time is during night (after sunset or before sunrise)
 */
export function isNightTime(time: Date, sunrise: Date, sunset: Date): boolean {
	return time > sunset || time < sunrise;
}

/**
 * Interpolate between two values based on progress (0 to 1)
 */
function interpolate(start: number, end: number, progress: number): number {
	return start * (1 - progress) + end * progress;
}

/**
 * Interpolate sun times between departure and destination
 */
function interpolateSunTimes(
	depSunTimes: SunTimes,
	destSunTimes: SunTimes,
	progress: number,
): SunTimes {
	return {
		sunrise: new Date(
			interpolate(
				depSunTimes.sunrise.getTime(),
				destSunTimes.sunrise.getTime(),
				progress,
			),
		),
		sunset: new Date(
			interpolate(
				depSunTimes.sunset.getTime(),
				destSunTimes.sunset.getTime(),
				progress,
			),
		),
	};
}

/**
 * Convert time string (HH:MM) to Date object on a specific date
 */
function timeStringToDate(timeStr: string, date: Date): Date {
	const [hours, minutes] = timeStr.split(":").map(Number);
	const result = new Date(date);
	result.setUTCHours(hours, minutes, 0, 0);
	return result;
}

/**
 * Calculate night time minutes for a flight
 * @param flightDate - Date of the flight
 * @param flightStart - Start time in HH:MM format (UTC)
 * @param flightEnd - End time in HH:MM format (UTC)
 * @param departureAirport - Departure airport with coordinates
 * @param destinationAirport - Destination airport with coordinates
 * @returns Number of minutes flown during night
 */
export async function calculateNightTime(
	flightDate: Date,
	flightStart: string,
	flightEnd: string,
	departureAirport: SelectedAirport,
	destinationAirport: SelectedAirport,
): Promise<number> {
	// Validate coordinates
	if (
		departureAirport.lat === null ||
		departureAirport.lon === null ||
		destinationAirport.lat === null ||
		destinationAirport.lon === null
	) {
		console.warn("Missing coordinates for one or both airports");
		return 0;
	}

	// Fetch sun times for both airports
	const [depSunTimes, destSunTimes] = await Promise.all([
		getSunTimes(departureAirport.lat, departureAirport.lon, flightDate),
		getSunTimes(destinationAirport.lat, destinationAirport.lon, flightDate),
	]);

	if (!depSunTimes || !destSunTimes) {
		console.warn("Failed to fetch sun times");
		return 0;
	}

	// Convert flight times to Date objects
	const flightStartTime = timeStringToDate(flightStart, flightDate);
	const flightEndTime = timeStringToDate(flightEnd, flightDate);

	// Handle flight spanning midnight
	if (flightEndTime < flightStartTime) {
		flightEndTime.setDate(flightEndTime.getDate() + 1);
	}

	const totalFlightMinutes =
		(flightEndTime.getTime() - flightStartTime.getTime()) / (60 * 1000);

	let nightMinutes = 0;

	// Check each minute of the flight
	for (let minute = 0; minute <= totalFlightMinutes; minute++) {
		const currentTime = new Date(
			flightStartTime.getTime() + minute * 60 * 1000,
		);
		const progress = minute / totalFlightMinutes;

		// Interpolate sun times based on flight progress
		const currentSunTimes = interpolateSunTimes(
			depSunTimes,
			destSunTimes,
			progress,
		);

		// Check if current time is during night
		if (
			isNightTime(currentTime, currentSunTimes.sunrise, currentSunTimes.sunset)
		) {
			nightMinutes++;
		}
	}

	return nightMinutes;
}

/**
 * Determine if takeoff occurred during night
 */
export async function isTakeoffAtNight(
	flightDate: Date,
	flightStart: string,
	departureAirport: SelectedAirport,
): Promise<boolean> {
	if (departureAirport.lat === null || departureAirport.lon === null) {
		return false;
	}

	const sunTimes = await getSunTimes(
		departureAirport.lat,
		departureAirport.lon,
		flightDate,
	);

	if (!sunTimes) return false;

	const takeoffTime = timeStringToDate(flightStart, flightDate);
	return isNightTime(takeoffTime, sunTimes.sunrise, sunTimes.sunset);
}

/**
 * Determine if landing occurred during night
 */
export async function isLandingAtNight(
	flightDate: Date,
	flightEnd: string,
	destinationAirport: SelectedAirport,
): Promise<boolean> {
	if (destinationAirport.lat === null || destinationAirport.lon === null) {
		return false;
	}

	const sunTimes = await getSunTimes(
		destinationAirport.lat,
		destinationAirport.lon,
		flightDate,
	);

	if (!sunTimes) return false;

	const landingTime = timeStringToDate(flightEnd, flightDate);
	return isNightTime(landingTime, sunTimes.sunrise, sunTimes.sunset);
}
