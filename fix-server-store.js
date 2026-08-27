const fs = require('fs');
const p = 'lib/server-store.ts';
const c = fs.readFileSync(p, 'utf8');

const persistenceCode = `
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".local", "server-store.json");

async function loadFromFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!global.serverParents) global.serverParents = data.parents || [];
    if (!global.serverSessions) global.serverSessions = data.sessions || [];
  } catch {
    if (!global.serverParents) global.serverParents = [];
    if (!global.serverSessions) global.serverSessions = [];
  }
}

async function saveToFile() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({
      parents: global.serverParents,
      sessions: global.serverSessions,
    }), "utf-8");
  } catch {
    // Ignore file system errors
  }
}

`;

const newC = c.replace('"use server";\n\n', '"use server";\n\n' + persistenceCode);

const withSaveParents = newC.replace(
  'export function createServerParent(parent: any) {\n  const parents = getServerParents();\n  parents.push(parent);\n  return parent;\n}',
  'export function createServerParent(parent: any) {\n  const parents = getServerParents();\n  parents.push(parent);\n  saveToFile();\n  return parent;\n}'
);

const withSaveSessions = withSaveParents.replace(
  'export function createServerSession(session: any) {\n  const sessions = getServerSessions();\n  sessions.push(session);\n  return session;\n}',
  'export function createServerSession(session: any) {\n  const sessions = getServerSessions();\n  sessions.push(session);\n  saveToFile();\n  return session;\n}'
);

const withSaveDelete = withSaveSessions.replace(
  'export function deleteServerSession(token: string) {\n  const sessions = getServerSessions();\n  const index = sessions.findIndex((s: any) => s.token === token);\n  if (index >= 0) {\n    sessions.splice(index, 1);\n  }\n}',
  'export function deleteServerSession(token: string) {\n  const sessions = getServerSessions();\n  const index = sessions.findIndex((s: any) => s.token === token);\n  if (index >= 0) {\n    sessions.splice(index, 1);\n    saveToFile();\n  }\n}'
);

const withUpdateSave = withSaveDelete.replace(
  'export function updateServerParent(id: string, updates: any) {\n  const parents = getServerParents();\n  const index = parents.findIndex((p: any) => p.id === id);\n  if (index >= 0) {\n    parents[index] = { ...parents[index], ...updates };\n  }\n}',
  'export function updateServerParent(id: string, updates: any) {\n  const parents = getServerParents();\n  const index = parents.findIndex((p: any) => p.id === id);\n  if (index >= 0) {\n    parents[index] = { ...parents[index], ...updates };\n    saveToFile();\n    return parents[index];\n  }\n  return null;\n}'
);

const final = withUpdateSave + '\nloadFromFile();\n';
fs.writeFileSync(p, final);
