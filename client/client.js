'use strict';

const mic = require('./lib/mic');
const fs = require('fs');
const request = require('request');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

let micInstance = mic({ 'rate': '16000', 'channels': '1', 'debug': true, 'exitOnSilence': 6 });
let micInputStream = micInstance.getAudioStream();

// let outputFileStream = fs.WriteStream('output.raw'); 
// let outputFileStreamSpeech = fs.WriteStream('output_speech.raw');

let speechInAction = false;
micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length);
    if(speechInAction) {
        client.send(data, 41234, 'localhost');
    }
});

micInputStream.on('error', function(err) {
    console.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function() {
    console.log("Got SIGNAL startComplete");
});

micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
});

micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
});

micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
});

micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence, stopping writing to file");
    // micInputStream.unpipe(outputFileStreamSpeech);
    speechInAction = false;

});

micInputStream.on('speech', function() {
    console.log("Got SIGNAL speech");
    if(speechInAction == false) {
        console.log('starting to write to server/local file');
        speechInAction = true;
        // micInputStream.pipe(outputFileStream);
        // micInputStream.pipe(outputFileStreamSpeech);
    }
});

micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
});

micInstance.start();