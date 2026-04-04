import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { store } from "../../store";
import Login from "./Login";

describe("Login", () => {
	it("renders login button", () => {
		render(
			<Provider store={store}>
				<MemoryRouter>
					<Login />
				</MemoryRouter>
			</Provider>,
		);
		expect(screen.getByRole("button", { name: /zaloguj przez google/i }));
	});
});
