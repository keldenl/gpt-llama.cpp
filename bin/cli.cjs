#!/usr/bin/env node

const { spawn } = require('child_process');

const child = spawn('npm', ['run', 'start'], { stdio: 'inherit' });

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
    } else {
        process.exit(code);
    }
});