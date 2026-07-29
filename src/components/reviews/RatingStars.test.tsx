import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RatingStars } from "./RatingStars";

describe("RatingStars", () => {
  it("represents fractional averages with a partial star", () => {
    const html = renderToStaticMarkup(<RatingStars rating={3.5} />);
    expect(html).toContain("3.5 de 5 estrelas");
    expect(html).toContain("width:50%");
  });

  it("clamps ratings to the supported range", () => {
    expect(renderToStaticMarkup(<RatingStars rating={8} />)).toContain("5.0 de 5 estrelas");
    expect(renderToStaticMarkup(<RatingStars rating={-1} />)).toContain("0.0 de 5 estrelas");
  });
});
