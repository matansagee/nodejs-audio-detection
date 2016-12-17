'use strict';

const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const fs = require('fs');
const Speaker = require('speaker');
const stream = require('stream');
let audioStream = new stream.PassThrough();

// Create the Speaker instance
let speaker = new Speaker({
    channels: 1,          // 1 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 16000     // 16,000 Hz sample rate
});

// PCM data from the udp server gets piped into the speaker
audioStream.pipe(speaker);

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // outputFileStream.write(msg);
    audioStream.push(msg)
});

server.on('listening', () => {
    var address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(41234);