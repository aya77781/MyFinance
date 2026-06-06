// Libere les ports utilises par le backend (4000) et Metro/Expo (8081)
// avant de relancer `npm run dev`. Evite les erreurs EADDRINUSE et le
// prompt Expo "Use port 8082 instead?" quand un ancien process traine.
import { execSync } from 'node:child_process';

const PORTS = [4000, 8081];
const isWin = process.platform === 'win32';

function pidsOnPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano -p tcp`, { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split('\n')) {
        if (line.includes('LISTENING') && line.includes(`:${port} `)) {
          const pid = line.trim().split(/\s+/).pop();
          if (pid && pid !== '0') pids.add(pid);
        }
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${port} -s tcp:LISTEN`, { encoding: 'utf8' });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function kill(pid) {
  try {
    execSync(isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

for (const port of PORTS) {
  const pids = pidsOnPort(port);
  if (pids.length === 0) {
    console.log(`Port ${port} : libre`);
    continue;
  }
  for (const pid of pids) {
    const ok = kill(pid);
    console.log(`Port ${port} : process ${pid} ${ok ? 'arrete' : 'non arrete'}`);
  }
}
