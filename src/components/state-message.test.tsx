import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/errors";
import { ErrorMessage } from "./state-message";

describe("ErrorMessage", () => {
  it("explains a rate limit instead of a generic error", () => {
    render(<ErrorMessage error={new ApiError("ratelimit")} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Too many requests");
  });

  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage error={new ApiError("network")} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
