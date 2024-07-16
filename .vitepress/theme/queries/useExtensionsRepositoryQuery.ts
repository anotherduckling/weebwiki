// Copyright (c) The Tachiyomi Open Source Project
// SPDX-License-Identifier: MPL-2.0

import { sources } from "../../repos";
import type { UseQueryOptions } from "@tanstack/vue-query";
import { useQuery } from "@tanstack/vue-query";
import axios from "axios";

export type ReleaseType = "stable" | "preview";

export interface Extension {
	name: string;
	pkg: string;
	apk: string;
	lang: string;
	code: number;
	version: string;
	nsfw: number;
	hasReadme: number;
	hasChangelog: number;
	sources: Source[];
}

export interface Source {
	name: string;
	lang: string;
	id: string;
	baseUrl: string;
	versionId: number;
}

type UseExtensionsRepositoryQueryOptions<S = Extension[]> = UseQueryOptions<
	Extension[],
	Error,
	S
>;

export default function useExtensionsRepositoryQuery<S = Extension[]>(
	sourceName: keyof typeof sources,
	// @ts-expect-error stop crying idk why
	options: UseExtensionsRepositoryQueryOptions<S> = {},
) {
	return useQuery<Extension[], Error, S>({
		queryKey: ["extensions", sourceName],
		queryFn: async () => {
			const { data } = await axios.get<Extension[]>(
				`${sources[sourceName]}/index.json`,
			);

			return data;
		},
		initialData: () => [],
		refetchOnWindowFocus: false,
		...options,
	});
}
