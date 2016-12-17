'use strict';
const Transform = require('stream').Transform;

class AudioTransform extends Transform {

    constructor(options) {
        super(options);
        if (options && options.debug) {
            this.debug = options.debug;
            delete options.debug;
        }
        this.consecSilenceCount = 0;
        this.numSilenceFramesExitThresh =0;
    }

    _transform(chunk, encoding, callback) {
        var i;
        var speechSample;
        var silenceLength = 0;
        var debug = this.debug;
        var consecutiveSilence = this.getConsecSilenceCount();
        if(this.getNumSilenceFramesExitThresh()) {
            for(i=0; i<chunk.length; i=i+2) {
                if(chunk[i+1] > 128) {
                    speechSample = (chunk[i+1] - 256) * 256;
                } else {
                    speechSample = chunk[i+1] * 256;
                }
                speechSample += chunk[i];

                if(Math.abs(speechSample) > 2000) {
                    // if (debug) {
                    //     console.log("Found speech block");
                    // }
                    this.resetConsecSilenceCount();
                    break;
                } else {
                    silenceLength++;
                }

            }
            if(silenceLength == chunk.length/2) {
                consecutiveSilence = this.incrConsecSilenceCount();
                if (debug) {
                    console.log("Found silence block: %d of %d", consecutiveSilence, this.getNumSilenceFramesExitThresh());
                }
                //emit 'silence' only once each time the threshold condition is met
                if( consecutiveSilence === this.getNumSilenceFramesExitThresh()) {
                    this.emit('silence');
                }
            } else {
                if (debug) {
                    console.log("Found speech block");
                }
                this.emit('speech');
            }

        }
        this.push(chunk);
        callback();
    };


    getNumSilenceFramesExitThresh() {
        return this.numSilenceFramesExitThresh;
    };

    getConsecSilenceCount() {
        return this.consecSilenceCount;
    };

    setNumSilenceFramesExitThresh(numFrames) {
        this.numSilenceFramesExitThresh = numFrames;
        return;
    };

    incrConsecSilenceCount() {
        this.consecSilenceCount++;
        return this.consecSilenceCount;
    };

    resetConsecSilenceCount() {
        this.consecSilenceCount = 0;
        return;
    };

}

module.exports = AudioTransform;