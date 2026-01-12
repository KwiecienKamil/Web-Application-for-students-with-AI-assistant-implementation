import { screen, render } from "@testing-library/react";
import Home from "./Home";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import supabase from "../../utils/supabase";

const mockNavigate = vi.fn();

vi.mock("../../utils/supabase", () => ({
  default: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSession = {
  user: { email: "test@example.com" },
} as any;

const renderHome = (session = mockSession) =>
  render(
    <MemoryRouter>
      <Home session={session} />
    </MemoryRouter>
  );

describe("Home", () => {
  it("renders logout button", () => {
    renderHome();

    expect(
      screen.getByRole("button", { name: /wyloguj się/i })
    ).toBeInTheDocument();
  });

  it("signs out and redirects to login", async () => {
    renderHome();

    await userEvent.click(screen.getByRole("button", { name: /wyloguj się/i }));

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
