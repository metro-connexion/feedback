import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

import { openBrowser } from "../utils/open-browser.js";
import { setToken } from "../utils/token-storage.js";

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Handle the CLI login flow by opening the browser and waiting for the OAuth-like callback.
 * @param {object} params - Handler parameters
 * @param {string} params.url - The base URL of the web application
 * @param {Function} params.oraService - Spinner factory (defaults to logger.spinner)
 * @param {Function} [params.openBrowserService] - Function to open a URL in the browser
 * @param {Function} [params.setTokenService] - Function to store the received token
 * @returns {Promise<void>}
 */
async function loginHandler({
  url,
  oraService,
  openBrowserService = openBrowser,
  setTokenService = setToken,
}) {
  const state = randomUUID();
  const spinner = oraService("Ouverture du navigateur...");

  return new Promise(function(resolve, reject) {
    let settled = false;

    const server = createServer(function(req, res) {
      const reqUrl = new URL(req.url, "http://localhost");

      if (reqUrl.pathname !== "/cli-callback") {
        res.writeHead(404);
        res.end();
        return;
      }

      const receivedState = reqUrl.searchParams.get("state");
      const token = reqUrl.searchParams.get("token");

      if (receivedState !== state) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Erreur : état invalide.</h1>");
        server.close();
        spinner.fail("Échec de la connexion : état invalide.");
        if (!settled) {
          settled = true;
          reject(new Error("Invalid state"));
        }
        return;
      }

      if (!token) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Erreur : token manquant.</h1>");
        server.close();
        spinner.fail("Échec de la connexion : token manquant.");
        if (!settled) {
          settled = true;
          reject(new Error("Missing token"));
        }
        return;
      }

      setTokenService(token);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>Connexion réussie !</h1><p>Vous pouvez fermer cet onglet et retourner dans le terminal.</p>");
      server.close();
      spinner.succeed("Connexion réussie !");
      if (!settled) {
        settled = true;
        resolve();
      }
    });

    const timeout = setTimeout(function() {
      server.close();
      spinner.fail("Délai d'attente dépassé. Veuillez réessayer.");
      if (!settled) {
        settled = true;
        reject(new Error("Login timeout"));
      }
    }, LOGIN_TIMEOUT_MS);

    server.listen(0, "localhost", function() {
      const { port } = server.address();
      const callbackUrl = `http://localhost:${port}/cli-callback`;
      const loginUrl = `${url}/authentication/cli-login?state=${state}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

      openBrowserService(loginUrl);
      spinner.text = "En attente de l'autorisation dans le navigateur...";
    });

    server.on("close", function() {
      clearTimeout(timeout);
    });

    server.on("error", function(error) {
      clearTimeout(timeout);
      spinner.fail("Erreur lors de la connexion.");
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
  });
}

export { loginHandler };
