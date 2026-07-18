import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_LAB_ROOT = path.resolve(
  SCRIPT_DIR,
  "../../src/app/__design-lab/notes",
);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const REVIEWED_ASSET_EXTENSIONS = new Set([".css"]);

const RESOLUTION_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.jsx",
];

const ALLOWED_EXTERNAL_MODULES = new Set([
  "next",
  "next/dynamic",
  "next/navigation",
  "react",
  "react/jsx-runtime",
]);

const TEST_ONLY_EXTERNAL_MODULES = new Set(["node:assert/strict", "node:test"]);

const FORBIDDEN_IMPORT_PATTERNS = [
  [/(^|[/@-])(actions?|mutations?)([/.-]|$)/i, "production mutation module"],
  [/(^|[/@-])(server|server-only)([/.-]|$)/i, "server module"],
  [/(^|[/@-])(database|db|drizzle|libsql|turso|prisma)([/.-]|$)/i, "database module"],
  [/(^|[/@-])(auth|clerk|next-auth)([/.-]|$)/i, "authentication module"],
  [/(^|[/@-])(analytics|sentry|posthog|segment|mixpanel|clarity)([/.-]|$)/i, "analytics module"],
  [/^(node:)?(http|https|http2|net|tls|dns|dgram)(\/|$)/i, "network module"],
  [/^(axios|got|undici|superagent|ky)(\/|$)/i, "network client"],
  [/(^|[/@-])(redis|kv|storage)([/.-]|$)/i, "persistence module"],
];

const FORBIDDEN_GLOBAL_IDENTIFIERS = new Map([
  ["fetch", "network request API"],
  ["XMLHttpRequest", "network request API"],
  ["WebSocket", "network socket API"],
  ["EventSource", "network event stream API"],
  ["WebTransport", "network transport API"],
  ["RTCPeerConnection", "peer network API"],
  ["localStorage", "persistent browser storage"],
  ["sessionStorage", "browser session storage"],
  ["indexedDB", "persistent browser database"],
  ["cookieStore", "browser cookie storage"],
  ["CacheStorage", "persistent browser cache"],
  ["caches", "persistent browser cache"],
  ["BroadcastChannel", "cross-context data channel"],
  ["SharedWorker", "cross-context worker"],
  ["Worker", "background worker"],
  ["Image", "implicit network-loading API"],
  ["Audio", "implicit network-loading API"],
  ["eval", "dynamic code evaluation"],
  ["Function", "dynamic code evaluation"],
  ["gtag", "analytics API"],
  ["dataLayer", "analytics data layer"],
  ["posthog", "analytics API"],
  ["mixpanel", "analytics API"],
  ["clarity", "analytics API"],
  ["console", "runtime logging can disclose private fixture or draft data"],
]);

const FORBIDDEN_PROPERTY_NAMES = new Map([
  ["sendBeacon", "network beacon API"],
  ["serviceWorker", "persistent service worker"],
  ["storage", "persistent navigator storage"],
  ["credentials", "browser credential store"],
  ["geolocation", "device geolocation API"],
  ["cookie", "browser cookie storage"],
  ["showOpenFilePicker", "local file access API"],
  ["showSaveFilePicker", "local file access API"],
  ["showDirectoryPicker", "local directory access API"],
]);

const FORBIDDEN_ENVIRONMENT_KEY_PATTERN =
  /(?:DATABASE_URL|TURSO|LIBSQL|TASKS_(?:APP|API|SHARED)|TIMELINE_(?:APP|API|SHARED)|CLERK|SENTRY|CAPTURE_(?:EMAIL|TOKEN)|API_KEY|AUTH_TOKEN|_SECRET$)/i;

const FORBIDDEN_NETWORK_LITERAL_PATTERNS = [
  [/\/api\//i, "application API route"],
  [/(?:https?:\/\/)?(?:[a-z0-9-]+\.)*signalstudio\.ie\b/i, "production Signal Studio hostname"],
  [/(?:https?:\/\/)?[^\s"']*(?:turso\.io|libsql\.com|clerk\.com|sentry\.io)\b/i, "production service hostname"],
];

const FORBIDDEN_RESOURCE_ELEMENTS = new Set([
  "audio",
  "embed",
  "iframe",
  "img",
  "link",
  "object",
  "picture",
  "script",
  "source",
  "track",
  "video",
]);

const ALLOWED_ENVIRONMENT_KEYS = new Set([
  "NODE_ENV",
  "SIGNAL_NOTES_DESIGN_LAB",
  "VERCEL_ENV",
]);

function slash(value) {
  return value.split(path.sep).join("/");
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function walkFiles(root) {
  const files = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(absolute);
        continue;
      }
      const extension = path.extname(entry.name).toLowerCase();
      if (SOURCE_EXTENSIONS.has(extension) || REVIEWED_ASSET_EXTENSIONS.has(extension)) {
        files.push(absolute);
      }
    }
  }
  return files.sort();
}

function scriptKindFor(file) {
  const extension = path.extname(file).toLowerCase();
  if (extension === ".tsx") return ts.ScriptKind.TSX;
  if (extension === ".jsx") return ts.ScriptKind.JSX;
  if (extension === ".js" || extension === ".mjs" || extension === ".cjs") {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function resolveRelativeImport(importer, specifier) {
  const unresolved = path.resolve(path.dirname(importer), specifier);
  for (const suffix of RESOLUTION_SUFFIXES) {
    const candidate = `${unresolved}${suffix}`;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function sourceLocation(sourceFile, node) {
  const start = node.getStart(sourceFile, false);
  const location = sourceFile.getLineAndCharacterOfPosition(start);
  return { line: location.line + 1, column: location.character + 1 };
}

function importSpecifiers(sourceFile) {
  const found = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      found.push({
        value: node.moduleSpecifier.text,
        node: node.moduleSpecifier,
        declaration: node,
      });
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      found.push({
        value: node.moduleReference.expression.text,
        node: node.moduleReference.expression,
        declaration: node,
      });
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      found.push({
        value: node.arguments[0].text,
        node: node.arguments[0],
        declaration: node,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function propertyName(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (
    ts.isElementAccessExpression(node) &&
    node.argumentExpression &&
    ts.isStringLiteralLike(node.argumentExpression)
  ) {
    return node.argumentExpression.text;
  }
  return null;
}

function isPropertyNameIdentifier(node) {
  const parent = node.parent;
  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isPropertySignature(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isMethodSignature(parent) && parent.name === node)
  );
}

function environmentKey(node) {
  if (!ts.isPropertyAccessExpression(node) && !ts.isElementAccessExpression(node)) return null;
  const key = propertyName(node);
  const expression = node.expression;
  if (!key || (!ts.isPropertyAccessExpression(expression) && !ts.isElementAccessExpression(expression))) {
    return null;
  }
  const middle = propertyName(expression);
  const root = expression.expression;
  if (middle !== "env" || !ts.isIdentifier(root) || root.text !== "process") return null;
  return key;
}

function validateFrameworkImport(
  violations,
  root,
  file,
  sourceFile,
  specifier,
  declaration,
) {
  if (
    specifier !== "next" &&
    specifier !== "next/dynamic" &&
    specifier !== "next/navigation"
  ) return;
  if (!ts.isImportDeclaration(declaration) || !declaration.importClause) {
    addViolation(
      violations,
      root,
      file,
      sourceFile,
      declaration,
      "framework-capability",
      `${specifier} must use the reviewed named import shape`,
    );
    return;
  }

  const clause = declaration.importClause;
  const named = clause.namedBindings;
  if (specifier === "next/dynamic") {
    const importsOnlyDynamic =
      !clause.isTypeOnly &&
      clause.name?.text === "dynamic" &&
      !named;
    if (!importsOnlyDynamic) {
      addViolation(
        violations,
        root,
        file,
        sourceFile,
        declaration,
        "framework-capability",
        "The lab may import only the default dynamic loader from next/dynamic",
      );
    }
    return;
  }
  if (specifier === "next") {
    const importsOnlyMetadata =
      clause.isTypeOnly &&
      !clause.name &&
      named &&
      ts.isNamedImports(named) &&
      named.elements.length > 0 &&
      named.elements.every((element) => element.name.text === "Metadata");
    if (!importsOnlyMetadata) {
      addViolation(
        violations,
        root,
        file,
        sourceFile,
        declaration,
        "framework-capability",
        "The lab may import only the Metadata type from next",
      );
    }
    return;
  }

  const relativeFile = slash(path.relative(root, file));
  const allowedNavigationImports =
    relativeFile === "early-draft-bootstrap.tsx"
      ? new Set(["useServerInsertedHTML"])
      : new Set(["notFound"]);
  const importsOnlyReviewedCapability =
    !clause.isTypeOnly &&
    !clause.name &&
    named &&
    ts.isNamedImports(named) &&
    named.elements.length > 0 &&
    named.elements.every(
      (element) =>
        allowedNavigationImports.has(element.name.text) &&
        (!element.propertyName || element.propertyName.text === element.name.text),
    );
  if (!importsOnlyReviewedCapability) {
    addViolation(
      violations,
      root,
      file,
      sourceFile,
      declaration,
      "framework-capability",
      "The lab may import only its reviewed capability from next/navigation",
    );
  }
}

function addViolation(violations, root, file, sourceFile, node, rule, detail) {
  const location = sourceLocation(sourceFile, node);
  violations.push({
    file: slash(path.relative(root, file)),
    line: location.line,
    column: location.column,
    rule,
    detail,
  });
}

function auditSourceFile(root, file, violations) {
  const sourceText = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(file),
  );

  for (const diagnostic of sourceFile.parseDiagnostics) {
    const location = diagnostic.start == null
      ? { line: 0, column: 0 }
      : (() => {
          const point = sourceFile.getLineAndCharacterOfPosition(diagnostic.start);
          return { line: point.line + 1, column: point.character + 1 };
        })();
    violations.push({
      file: slash(path.relative(root, file)),
      ...location,
      rule: "parse-error",
      detail: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
    });
  }

  for (const { value: specifier, node, declaration } of importSpecifiers(sourceFile)) {
    for (const [pattern, capability] of FORBIDDEN_IMPORT_PATTERNS) {
      if (pattern.test(specifier)) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "forbidden-import",
          `${capability}: ${specifier}`,
        );
      }
    }

    if (specifier.startsWith(".")) {
      const resolved = resolveRelativeImport(file, specifier);
      if (!resolved) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "unresolved-import",
          `Could not resolve ${specifier}`,
        );
      } else if (!isInside(root, resolved)) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "lab-boundary-escape",
          `Relative import leaves the lab: ${specifier}`,
        );
      } else {
        const extension = path.extname(resolved).toLowerCase();
        if (!SOURCE_EXTENSIONS.has(extension) && !REVIEWED_ASSET_EXTENSIONS.has(extension)) {
          addViolation(
            violations,
            root,
            file,
            sourceFile,
            node,
            "unreviewed-asset-import",
            `The lab may only import reviewed source or CSS: ${specifier}`,
          );
        }
      }
      continue;
    }

    const isTestFile = /\.test\.[cm]?[jt]sx?$/.test(file);
    const isAllowedTestModule = isTestFile && TEST_ONLY_EXTERNAL_MODULES.has(specifier);
    if (!ALLOWED_EXTERNAL_MODULES.has(specifier) && !isAllowedTestModule) {
      addViolation(
        violations,
        root,
        file,
        sourceFile,
        node,
        "external-module",
        `External module is not on the lab allowlist: ${specifier}`,
      );
    }
    validateFrameworkImport(
      violations,
      root,
      file,
      sourceFile,
      specifier,
      declaration,
    );
  }

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
      (node.arguments.length !== 1 || !ts.isStringLiteralLike(node.arguments[0]))
    ) {
      addViolation(
        violations,
        root,
        file,
        sourceFile,
        node,
        "dynamic-import",
        "Computed imports can escape the reviewed lab source graph",
      );
    }

    if (
      ts.isExpressionStatement(node) &&
      ts.isStringLiteral(node.expression) &&
      node.expression.text === "use server"
    ) {
      addViolation(
        violations,
        root,
        file,
        sourceFile,
        node,
        "server-directive",
        "Server actions are forbidden in the design lab",
      );
    }

    if (ts.isIdentifier(node) && !isPropertyNameIdentifier(node)) {
      const capability = FORBIDDEN_GLOBAL_IDENTIFIERS.get(node.text);
      if (capability) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "forbidden-capability",
          capability,
        );
      }
    }

    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const name = propertyName(node);
      const capability = name ? FORBIDDEN_PROPERTY_NAMES.get(name) : null;
      if (capability) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "forbidden-capability",
          capability,
        );
      }

      const expression = node.expression;
      const globalObject = ts.isIdentifier(expression)
        ? expression.text
        : null;
      if (
        globalObject &&
        ["globalThis", "self", "window"].includes(globalObject) &&
        name &&
        FORBIDDEN_GLOBAL_IDENTIFIERS.has(name)
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "forbidden-capability",
          FORBIDDEN_GLOBAL_IDENTIFIERS.get(name),
        );
      }
      if (
        ts.isElementAccessExpression(node) &&
        globalObject &&
        ["document", "globalThis", "navigator", "self", "window"].includes(globalObject) &&
        node.argumentExpression &&
        !ts.isStringLiteralLike(node.argumentExpression)
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "computed-browser-capability",
          `Computed access on ${globalObject} can evade the reviewed capability allowlist`,
        );
      }
      if (
        ts.isIdentifier(expression) &&
        expression.text === "navigator" &&
        name !== "clipboard"
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "navigator-capability",
          `Only navigator.clipboard is allowed, not navigator.${name ?? "[computed]"}`,
        );
      }
      if (
        ts.isIdentifier(expression) &&
        ["globalThis", "self", "window"].includes(expression.text) &&
        ["open", "postMessage"].includes(name ?? "")
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "cross-boundary-browser-capability",
          `${expression.text}.${name} can cross the isolated lab boundary`,
        );
      }
      if (
        name &&
        ["back", "forward", "go", "pushState"].includes(name) &&
        ((ts.isIdentifier(expression) && expression.text === "history") ||
          (ts.isPropertyAccessExpression(expression) && expression.name.text === "history"))
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "navigation-side-effect",
          `History.${name} is forbidden; only history.replaceState is allowed`,
        );
      }

      const envKey = environmentKey(node);
      if (envKey && !ALLOWED_ENVIRONMENT_KEYS.has(envKey)) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "environment-boundary",
          `Environment variable is not on the lab allowlist: ${envKey}`,
        );
      }

      if (name && FORBIDDEN_ENVIRONMENT_KEY_PATTERN.test(name)) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "production-secret-capability",
          `Production or cross-product secret key is forbidden: ${name}`,
        );
      }

      if (
        name &&
        ["assign", "reload", "replace"].includes(name) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "location"
      ) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "navigation-side-effect",
          `Location.${name} can leave or reload the isolated lab`,
        );
      }
    }

    if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      for (const [pattern, capability] of FORBIDDEN_NETWORK_LITERAL_PATTERNS) {
        if (pattern.test(node.text)) {
          addViolation(
            violations,
            root,
            file,
            sourceFile,
            node,
            "network-endpoint",
            `${capability} is forbidden in the fixture-only lab`,
          );
        }
      }
      if (FORBIDDEN_ENVIRONMENT_KEY_PATTERN.test(node.text)) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "production-secret-capability",
          "Production or cross-product secret names are forbidden in the lab",
        );
      }
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile).toLowerCase();
      const relativeFile = slash(path.relative(root, file));
      const attributeNames = node.attributes.properties.map((property) =>
        ts.isJsxAttribute(property)
          ? property.name.getText(sourceFile)
          : "{spread}",
      );
      const isReviewedEarlyDraftScript =
        relativeFile === "early-draft-bootstrap.tsx" &&
        tag === "script" &&
        attributeNames.length === 3 &&
        ["id", "data-reviewed-inline-script", "dangerouslySetInnerHTML"].every(
          (name) => attributeNames.includes(name),
        );
      if (FORBIDDEN_RESOURCE_ELEMENTS.has(tag) && !isReviewedEarlyDraftScript) {
        addViolation(
          violations,
          root,
          file,
          sourceFile,
          node,
          "remote-resource-element",
          `<${tag}> can initiate an implicit network request`,
        );
      }
      for (const property of node.attributes.properties) {
        const isReviewedEarlyDraftMarkup =
          isReviewedEarlyDraftScript &&
          property.name.getText(sourceFile) === "dangerouslySetInnerHTML";
        if (
          ts.isJsxAttribute(property) &&
          [
            "action",
            "dangerouslySetInnerHTML",
            "formAction",
            "href",
            "src",
            "srcSet",
          ].includes(property.name.getText(sourceFile)) &&
          !isReviewedEarlyDraftMarkup
        ) {
          addViolation(
            violations,
            root,
            file,
            sourceFile,
            property,
            "remote-or-unsafe-resource",
            `${property.name.getText(sourceFile)} is forbidden in the isolated lab`,
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

function auditCssFile(root, file, violations) {
  const source = fs.readFileSync(file, "utf8");
  const patterns = [
    { pattern: /@import\b/gi, detail: "CSS @import can load an external resource" },
    { pattern: /url\s*\(/gi, detail: "CSS url() can load an external resource" },
  ];
  for (const { pattern, detail } of patterns) {
    for (const match of source.matchAll(pattern)) {
      const before = source.slice(0, match.index);
      const lines = before.split(/\r?\n/);
      violations.push({
        file: slash(path.relative(root, file)),
        line: lines.length,
        column: lines.at(-1).length + 1,
        rule: "css-network-capability",
        detail,
      });
    }
  }
}

export function auditDesignLabBoundary(labRoot = DEFAULT_LAB_ROOT) {
  const root = path.resolve(labRoot);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Signal Notes design lab directory does not exist: ${root}`);
  }

  const files = walkFiles(root);
  const violations = [];
  for (const file of files) {
    if (REVIEWED_ASSET_EXTENSIONS.has(path.extname(file).toLowerCase())) {
      auditCssFile(root, file, violations);
    } else {
      auditSourceFile(root, file, violations);
    }
  }

  return {
    root,
    files: files.map((file) => slash(path.relative(root, file))),
    violations: violations.sort(
      (left, right) =>
        left.file.localeCompare(right.file) ||
        left.line - right.line ||
        left.column - right.column ||
        left.rule.localeCompare(right.rule),
    ),
  };
}

export function formatBoundaryReport(report) {
  const heading = `Signal Notes design lab privacy boundary: ${report.files.length} files checked`;
  if (report.violations.length === 0) {
    return `${heading}\nPASS: imports remain local and no forbidden mutation, server, database, auth, analytics, network, or persistence capability was found.`;
  }
  const details = report.violations.map(
    (violation) =>
      `${violation.file}:${violation.line}:${violation.column} [${violation.rule}] ${violation.detail}`,
  );
  return `${heading}\nFAIL: ${report.violations.length} boundary violation(s)\n${details.join("\n")}`;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  const report = auditDesignLabBoundary();
  console.log(formatBoundaryReport(report));
  if (report.violations.length > 0) process.exitCode = 1;
}
