import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthCallback from "./features/auth/authCallback";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import type { RootState } from "./store";
import "./index.css";
import PaymentSuccess from "./features/billing/components/PaymentSuccess";
import Checkout from "./pages/Checkout/Checkout";

function App() {
	useSupabaseAuth();
	const session = useSelector((state: RootState) => state.auth.session);
	return (
		<>
			<Routes>
				<Route path="/" element={<Home session={session} />} />
				<Route path="/login" element={<Login />} />
				<Route
					path="/register"
					element={session ? <Navigate to="/" /> : <Register />}
				/>

				<Route path="/auth/callback" element={<AuthCallback />} />
				<Route path="/platnosc" element={<Checkout />} />
				<Route path="/payment-success" element={<PaymentSuccess />} />
			</Routes>
		</>
	);
}

export default App;
