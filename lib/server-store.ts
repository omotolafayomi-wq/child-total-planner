"use server";


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

declare global {
  var serverParents: any[] | undefined;
  var serverSessions: any[] | undefined;
}

function getServerParents() {
  if (!global.serverParents) {
    global.serverParents = [];
  }
  return global.serverParents;
}

function getServerSessions() {
  if (!global.serverSessions) {
    global.serverSessions = [];
  }
  return global.serverSessions;
}

export function getServerParentByEmail(email: string) {
  return getServerParents().find((p: any) => p.email === email);
}

export function createServerParent(parent: any) {
  const parents = getServerParents();
  parents.push(parent);
  saveToFile();
  return parent;
}

export function getServerSession(token: string) {
  const sessions = getServerSessions();
  return sessions.find((s: any) => s.token === token);
}

export function createServerSession(session: any) {
  const sessions = getServerSessions();
  sessions.push(session);
  saveToFile();
  return session;
}

export function deleteServerSession(token: string) {
  const sessions = getServerSessions();
  const index = sessions.findIndex((s: any) => s.token === token);
  if (index >= 0) {
    sessions.splice(index, 1);
    saveToFile();
  }
}

export function updateServerParent(parentId: string, updates: any) {
  const parents = getServerParents();
  const index = parents.findIndex((p: any) => p.id === parentId);
  if (index >= 0) {
    parents[index] = { ...parents[index], ...updates };
    saveToFile();
    return parents[index];
  }
  return null;
}

loadFromFile();
