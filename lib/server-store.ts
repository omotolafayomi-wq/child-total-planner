"use server";

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
  return parent;
}

export function getServerSession(token: string) {
  const sessions = getServerSessions();
  return sessions.find((s: any) => s.token === token);
}

export function createServerSession(session: any) {
  const sessions = getServerSessions();
  sessions.push(session);
  return session;
}

export function deleteServerSession(token: string) {
  const sessions = getServerSessions();
  const index = sessions.findIndex((s: any) => s.token === token);
  if (index >= 0) {
    sessions.splice(index, 1);
  }
}

export function updateServerParent(parentId: string, updates: any) {
  const parents = getServerParents();
  const index = parents.findIndex((p: any) => p.id === parentId);
  if (index >= 0) {
    parents[index] = { ...parents[index], ...updates };
  }
}
