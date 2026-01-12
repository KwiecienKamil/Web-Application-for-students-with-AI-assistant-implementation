import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Login from "./Login";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../store";

describe("Login", () => {
  it("renders login button", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole("button", { name: /zaloguj przez google/i }));
  });
});
