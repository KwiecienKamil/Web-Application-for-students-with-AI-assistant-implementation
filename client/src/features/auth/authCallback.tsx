import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAuthWrapper from "../../components/UserAuthWrapper/UserAuthWrapper";
import { setSession } from "../../features/auth/authSlice";
import { setUser } from "../../features/auth/userSlice";
import { useAppDispatch } from "../../store/hooks";
import supabase from "../../utils/supabase";
import "../../pages/Login/login.css";
import "./authCallback.css";

const AuthCallback = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const handleCallback = async () => {
			const { data, error } = await supabase.auth.getSession();

			if (error || !data.session) {
				navigate("/login");
				return;
			}

			const session = data.session;
			const user = session.user;

			dispatch(setSession(session));

			await fetch(`${import.meta.env.VITE_SERVER_URL}/save-user`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					email: user.email,
					name:
						user.user_metadata?.full_name || user.user_metadata?.name || null,
					picture: user.user_metadata?.avatar_url || null,
					is_beta_tester: false,
				}),
			}).then(async (res) => {
				if (res.ok) {
					dispatch(setUser(await res.json()));
				}
			});

			navigate("/");
		};

		handleCallback();
	}, [dispatch, navigate]);

	return (
		<UserAuthWrapper>
			<div className="auth-form auth-callback">
				<div className="auth-callback-spinner" aria-hidden="true" />
				<h2 className="auth-callback-title">Potwierdzanie konta...</h2>
				<p className="auth-callback-subtitle">
					Proszę czekać, logujemy Cię do aplikacji.
				</p>
			</div>
		</UserAuthWrapper>
	);
};

export default AuthCallback;
