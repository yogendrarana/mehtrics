import { createMDXSource } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { createElement } from "react";

export const source = loader({
  baseUrl: "/docs",
  source: createMDXSource([], []),
});
