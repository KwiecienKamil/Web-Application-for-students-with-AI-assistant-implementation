import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { setUser } from "../../../features/auth/userSlice";
import { updateUserSettings } from "../../../services/settingsService";
import { useAppDispatch } from "../../../store/hooks";
import type { User } from "../../../types/UserProps";
import { Button } from "../../Button/Button";
import "./settings-form.css";

type SettingsFormProps = {
	accessToken: string;
	user: User | null;
};

const SettingsForm = ({ accessToken, user }: SettingsFormProps) => {
	const dispatch = useAppDispatch();
	const [name, setName] = useState("");
	const [isProfilePublic, setIsProfilePublic] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;

		setName(user.name ?? "");
		setIsProfilePublic(!!user.isProfilePublic);
	}, [user]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const { data: updatedUser } = await updateUserSettings(
				{
					username: name.trim(),
					isProfilePublic,
				},
				accessToken,
			);

			dispatch(setUser(updatedUser));
			toast.success("Ustawienia zapisane");
		} catch {
			setError("Nie udało się zapisać ustawień. Spróbuj ponownie.");
			toast.error("Wystąpił problem podczas zapisu ustawień");
		} finally {
			setLoading(false);
		}
	};

	if (!user) {
		return <p className="settings-subtitle">Ładowanie ustawień...</p>;
	}

	return (
		<form className="settings-form" onSubmit={handleSubmit}>
			<h2 className="settings-title">Ustawienia konta</h2>
			<p className="settings-subtitle">
				Zarządzaj danymi profilu i widocznością konta.
			</p>

			<div className="form-group">
				<label htmlFor="email">Email</label>
				<input id="email" type="email" value={user.email} disabled />
			</div>

			<div className="form-group">
				<label htmlFor="name">Nazwa wyświetlana</label>
				<input
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>

			<div className="form-group settings-checkbox-group">
				<label htmlFor="isProfilePublic">
					<input
						id="isProfilePublic"
						type="checkbox"
						checked={isProfilePublic}
						onChange={(e) => setIsProfilePublic(e.target.checked)}
					/>
					Profil publiczny
				</label>
			</div>

			<div className="settings-account-info">
				<p>
					Typ konta:{" "}
					{user.isPremium ? (
						<span>Premium</span>
					) : (
						"Zwykłe"
					)}
				</p>
			</div>

			{error ? <p className="settings-error">{error}</p> : null}

			<Button type="submit" variant="primary" size="lg" isLoading={loading}>
				Zapisz zmiany
			</Button>
		</form>
	);
};

export default SettingsForm;
