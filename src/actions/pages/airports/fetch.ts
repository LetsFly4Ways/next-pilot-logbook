"use server";

import {
  Airport,
  AirportDatabase,
  AirportDataError,
  Result,
  Runway,
  SortBy,
} from "@/types/airports";
import { cacheLife } from "next/cache";

/**
 * Fetch all airports from the JSON file
 */
export async function fetchAirports(): Promise<Result<Airport[]>> {
  "use cache";
  cacheLife("hours");

  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const filePath = path.join(process.cwd(), "public/data/airports.json");

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new AirportDataError(
        "Airport data file not found. Please ensure airports.json exists in public/data/"
      );
    }

    const fileContents = await fs.readFile(filePath, "utf8");

    // Parse JSON with error handling
    let data: AirportDatabase;
    try {
      data = JSON.parse(fileContents);
    } catch (parseError) {
      throw new AirportDataError(
        "Failed to parse airport data. The JSON file may be corrupted.",
        parseError
      );
    }

    // Validate data structure
    if (!data.airports || typeof data.airports !== "object") {
      throw new AirportDataError(
        'Invalid airport data structure. Expected an "airports" object.'
      );
    }

    const airports: Airport[] = Object.values(data.airports);

    if (airports.length === 0) {
      throw new AirportDataError("No airports found in the data file.");
    }

    return { success: true, data: airports };
  } catch (error) {
    console.error("Failed to fetch airports:", error);

    if (error instanceof AirportDataError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "An unexpected error occurred while loading airport data.",
    };
  }
}

/**
 * Get airports grouped by country
 */
export async function getAirportsByCountry(): Promise<
  Result<Record<string, Airport[]>>
> {
  // "use cache";
  // cacheLife("hours");

  const result = await fetchAirports();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const grouped = result.data.reduce((acc, airport) => {
      const country = airport.countryName || "Unknown";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(airport);
      return acc;
    }, {} as Record<string, Airport[]>);

    return { success: true, data: grouped };
  } catch (error) {
    console.error("Failed to group airports:", error);
    return {
      success: false,
      error: "Failed to organize airports by country.",
    };
  }
}

/**
 * Search and sort airports - runs on server
 */
export async function searchAndSortAirports(
  query: string,
  sortBy: SortBy
): Promise<Result<Airport[]>> {
  // "use cache";
  // cacheLife("minutes");

  const result = await fetchAirports();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    let filtered = result.data;

    // Apply search filter if query exists
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim();

      // Check for operator syntax (e.g., "icao:EBBR")
      const operatorMatch = lowerQuery.match(
        /^(icao|iata|country|city|name):(.+)$/
      );

      if (operatorMatch) {
        const [, operator, value] = operatorMatch;
        const searchValue = value.trim();

        filtered = filtered.filter((airport) => {
          switch (operator) {
            case "icao":
              return airport.icao.toLowerCase().includes(searchValue);
            case "iata":
              return airport.iata?.toLowerCase().includes(searchValue);
            case "name":
              return airport.name.toLowerCase().includes(searchValue);
            case "country":
              return (
                airport.countryName.toLowerCase().includes(searchValue) ||
                airport.countryCode.toLowerCase().includes(searchValue)
              );
            case "city":
              return airport.city.toLowerCase().includes(searchValue);
            default:
              return false;
          }
        });
      } else {
        // General search across all fields
        filtered = filtered.filter(
          (airport) =>
            airport.icao?.toLowerCase().includes(lowerQuery) ||
            (airport.iata && airport.iata.toLowerCase().includes(lowerQuery)) ||
            airport.name?.toLowerCase().includes(lowerQuery) ||
            airport.city?.toLowerCase().includes(lowerQuery) ||
            airport.countryName?.toLowerCase().includes(lowerQuery) ||
            airport.countryCode?.toLowerCase().includes(lowerQuery)
        );
      }
    }

    // Apply sorting
    const sorted = [...filtered];

    switch (sortBy) {
      case "country":
        sorted.sort((a, b) => {
          const countryA = a.countryName || "";
          const countryB = b.countryName || "";

          if (countryA && !countryB) return -1;
          if (!countryA && countryB) return 1;
          if (!countryA && !countryB) return a.name.localeCompare(b.name);

          if (countryA !== countryB) {
            return countryA.localeCompare(countryB);
          }
          return a.name.localeCompare(b.name);
        });
        break;
      case "icao":
        sorted.sort((a, b) => {
          const icaoA = a.icao || "";
          const icaoB = b.icao || "";

          if (icaoA && !icaoB) return -1;
          if (!icaoA && icaoB) return 1;
          if (!icaoA && !icaoB) return a.name.localeCompare(b.name);

          if (icaoA !== icaoB) {
            const aStartsWithLetter = /^[a-z]/i.test(icaoA);
            const bStartsWithLetter = /^[a-z]/i.test(icaoB);
            if (aStartsWithLetter && !bStartsWithLetter) return -1;
            if (!aStartsWithLetter && bStartsWithLetter) return 1;
            return icaoA.localeCompare(icaoB);
          }
          return a.name.localeCompare(b.name);
        });
        break;
      case "iata":
        sorted.sort((a, b) => {
          const aIata = a.iata || "";
          const bIata = b.iata || "";

          if (aIata && !bIata) return -1;
          if (!aIata && bIata) return 1;
          if (!aIata && !bIata) return a.name.localeCompare(b.name);

          if (aIata !== bIata) {
            return aIata.localeCompare(bIata);
          }
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return { success: true, data: sorted };
  } catch (error) {
    console.error("Failed to search and sort airports:", error);
    return {
      success: false,
      error: "An error occurred while processing airports.",
    };
  }
}

/**
 * Search airports by query string (legacy function, use searchAndSortAirports instead)
 */
export async function searchAirports(
  query: string
): Promise<Result<Airport[]>> {
  // "use cache";
  // cacheLife("minutes");

  return searchAndSortAirports(query, "country");
}

/**
 * Get a single airport by ICAO code
 */
export async function getAirportByIcao(icao: string): Promise<Result<Airport>> {
  // "use cache";
  // cacheLife("hours");

  const result = await fetchAirports();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const airport = result.data.find(
      (airport) => airport.icao.toLowerCase() === icao.toLowerCase()
    );

    if (!airport) {
      return {
        success: false,
        error: `Airport with ICAO code "${icao}" not found.`,
      };
    }

    return { success: true, data: airport };
  } catch (error) {
    console.error("Failed to find airport:", error);
    return {
      success: false,
      error: "An error occurred while looking up the airport.",
    };
  }
}

/**
 * Get the metadata from the airports data file
 */
export async function getAirportsMetadata(): Promise<
  Result<AirportDatabase["metadata"]>
> {
  // "use cache";
  // cacheLife("hours");

  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    const filePath = path.join(process.cwd(), "public/data/airports.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    const data: AirportDatabase = JSON.parse(fileContents);

    if (!data.metadata) {
      throw new AirportDataError("Metadata not found in airport data file.");
    }

    return { success: true, data: data.metadata };
  } catch (error) {
    console.error("Failed to fetch metadata:", error);

    if (error instanceof AirportDataError) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Failed to load airport metadata.",
    };
  }
}

/**
 * Get runway information for an airport
 */
export async function getAirportRunways(
  icao: string
): Promise<Result<Runway[]>> {
  // "use cache";
  // cacheLife("hours");

  const airportResult = await getAirportByIcao(icao);

  if (!airportResult.success) {
    return { success: false, error: airportResult.error };
  }

  try {
    const runways = airportResult.data.runways;

    if (!runways || runways.length === 0) {
      return {
        success: false,
        error: `No runway information available for ${icao}.`,
      };
    }

    return { success: true, data: runways };
  } catch (error) {
    console.error("Failed to get runways:", error);
    return {
      success: false,
      error: "An error occurred while retrieving runway information.",
    };
  }
}
