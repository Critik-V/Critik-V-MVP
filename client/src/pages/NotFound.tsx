import "./styles/NotFound.scss";
import notFoundImg from "@assets/not-found.png";
import logo from "@assets/logo.svg";
import { Link } from "react-router-dom";

export default function NotFound(): JSX.Element {
  return (
    <main id="not-found">
      <img src={logo} alt="logo de critik-v" />
      <img src={notFoundImg} alt="Page not found" />
      <p id="not-found-title">Page non trouvée</p>
      <p id="not-found-message">
        Il semble que la page que vous cherchez n'existe pas. Vérifiez l'URL ou revenez à la page
        d'accueil.
      </p>
      <Link to="/">
        <button>Page d'accueil</button>
      </Link>
    </main>
  );
}
