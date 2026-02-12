"use server";

import { readFile } from "fs/promises";
import { join } from "path";

export async function fetchStatement(file: string): Promise<string | null> {
	try {
		// Adjust the path based on where your license.md is located
		// This assumes it's in the root of your project
		const filePath = join(process.cwd(), file);
		const content = await readFile(filePath, "utf-8");
		return content;
	} catch (error) {
		console.error("Error reading license file:", error);
		return null;
	}
}
