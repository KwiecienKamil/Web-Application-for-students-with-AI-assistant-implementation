import api from "./api/client";

type UpdateSettingsPayload = {
	username: string;
	isProfilePublic: boolean;
};

export const updateUserSettings = (
	payload: UpdateSettingsPayload,
	accessToken: string,
) => {
	return api.put("/user/settings", payload, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
};
