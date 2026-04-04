import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import "./button.css";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		children: "Click me",
		variant: "primary",
	},
};

export const Secondary: Story = {
	args: {
		children: "Cancel",
		variant: "secondary",
	},
};

export const Loading: Story = {
	args: {
		children: "Saving",
		isLoading: true,
	},
};
