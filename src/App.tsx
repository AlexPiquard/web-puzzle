import { Game } from "./components/game";
import { ThemeProvider } from "./components/theme-provider";

export function App() {
	return (
		<ThemeProvider>
			<div className="p-8 flex flex-col items-center">
				<Game />
			</div>
		</ThemeProvider>
	);
}

export default App;
