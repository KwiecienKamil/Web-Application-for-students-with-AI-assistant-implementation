export type User = {
	id: string;
	email: string;
	name: string | null;
	picture: string | null;
	isPremium: boolean;
	terms_accepted: boolean;
	isBetaTester: boolean;
	isProfilePublic: boolean;
};
