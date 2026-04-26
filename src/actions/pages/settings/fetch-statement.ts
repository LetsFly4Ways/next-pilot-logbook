"use server";

import { readFile } from "fs/promises";
import { join } from "path";

const statementFiles: Record<string, string> = {
	"license.md": "LICENSE.md",
	"privacy.md": "PRIVACY.md",
	"terms_of_service.md": "TERMS_OF_SERVICE.md",
};

export async function fetchStatement(file: string): Promise<string | null> {
	try {
		const mappedFile = statementFiles[file] ?? file;
		const filePath = join(process.cwd(), mappedFile);
		const content = await readFile(filePath, "utf-8");
		return content;
	} catch (error) {
		console.error("Error reading statement file:", error);
		return null;
	}
}
