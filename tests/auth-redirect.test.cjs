
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const jsx = require("react/jsx-runtime");

function renderRedirect(auth) {
  const Navigate = function Navigate() {};
  const Loader = function Loader() {};
  const exports = {};
  const modules = {
    "react/jsx-runtime": jsx,
    "react-router-dom": { Navigate },
    "../../components/ui/Loader": { __esModule: true, default: Loader },
    "../../hooks/auth/useAuth": { useAuth: () => auth },
    "../../services/authService": { authService: {
      getAuthError: error => error.message,
      getUserProfile: () => { throw new Error("Redirect must not fetch the session again"); }
    }}
  };
  const source = ts.transpileModule(fs.readFileSync("src/pages/auth/RedirectPage.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => {
    if (!modules[name]) throw new Error("Unexpected dependency: " + name);
    return modules[name];
  } });
  return { view: exports.default(), Navigate, Loader };
}

test("redirect waits until the shared authentication context has finished", () => {
  const result = renderRedirect({ loading: true, user: null, isAuthenticated: false });
  assert.equal(result.view.type, result.Loader);
});
test("an authenticated affiliate goes to the dashboard without a second profile request", () => {
  const result = renderRedirect({ loading: false, user: { role: "client" }, isAuthenticated: true });
  assert.equal(result.view.type, result.Navigate);
  assert.equal(result.view.props.to, "/affiliate/overview");
});
test("an authenticated admin goes to the admin dashboard", () => {
  const result = renderRedirect({ loading: false, user: { role: "admin" }, isAuthenticated: true });
  assert.equal(result.view.props.to, "/admin/overview");
});
test("an API failure reaches the login page with its explanation", () => {
  const result = renderRedirect({
    loading: false, user: null, isAuthenticated: false, error: new Error("Client non trouvé.")
  });
  assert.equal(result.view.props.to, "/auth/login");
  assert.equal(result.view.props.state.authError, "Client non trouvé.");
});
