"use server";

import fs from "fs";
import path from "path";

interface ReleaseNote {
	version: string;
	date: string;
	description: string;
	changes: {
		added: string[];
		changed: string[];
		fixed: string[];
	};
}

export async function fetchReleaseNotes(): Promise<ReleaseNote[]> {
	try {
		// Read the changelog file
		const changelogPath = path.join(process.cwd(), ".github", "CHANGELOG.md");
		const changelogContent = fs.readFileSync(changelogPath, "utf-8");

		// Parse the changelog content
		const releases = parseChangelog(changelogContent);

		return releases;
	} catch (error) {
		console.error("Error fetching release notes:", error);
		return [];
	}
}

function parseChangelog(content: string): ReleaseNote[] {
	const releases: ReleaseNote[] = [];

	// Split content by version headers (## [version] - date)
	const versionRegex = /## \[([^\]]+)\]\s*-\s*([^\n]+)/g;
	const sections = content.split(versionRegex);

	// Remove the first element which is the title and separator
	const versionSections = sections.slice(1);

	// Process each version section
	for (let i = 0; i < versionSections.length; i += 3) {
		if (i + 2 < versionSections.length) {
			const version = versionSections[i];
			const date = versionSections[i + 1];
			const content = versionSections[i + 2];

			const release = parseReleaseSection(version, date, content);
			if (release) {
				releases.push(release);
			}
		}
	}

	return releases;
}

function parseReleaseSection(
	version: string,
	date: string,
	content: string,
): ReleaseNote | null {
	if (!version || !date || !content) {
		return null;
	}

	const changes = {
		added: [] as string[],
		changed: [] as string[],
		fixed: [] as string[],
	};

	// Extract description (text before first ### section)
	const descriptionMatch = content.match(/^([^#]+)/);
	const description = descriptionMatch ? descriptionMatch[1].trim() : "";

	// Parse different sections
	const addedMatch = content.match(/### Added\n([\s\S]*?)(?=### |$)/);
	if (addedMatch) {
		changes.added = parseChangeList(addedMatch[1]);
	}

	const changedMatch = content.match(/### Changed\n([\s\S]*?)(?=### |$)/);
	if (changedMatch) {
		changes.changed = parseChangeList(changedMatch[1]);
	}

	const fixedMatch = content.match(/### Fixed\n([\s\S]*?)(?=### |$)/);
	if (fixedMatch) {
		changes.fixed = parseChangeList(fixedMatch[1]);
	}

	return {
		version: version.trim(),
		date: date.trim(),
		description: description,
		changes,
	};
}

function parseChangeList(content: string): string[] {
	if (!content.trim()) {
		return [];
	}

	// Split by lines and filter out empty ones
	return content
		.split("\n")
		.map((line) => line.replace(/^[-*]\s*/, "").trim())
		.filter((line) => line.length > 0);
}
