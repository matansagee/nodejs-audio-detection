'use strict';
const Readable = require('stream').Readable;

class AudioStream extends Readable {
    constructor(options) {
        super(options);

        this._source = getLowlevelSourceObject();

        // Every time there's data, push it into the internal buffer.
        this._source.ondata = (chunk) => {
            // if push() returns false, then stop reading from source
            if (!this.push(chunk))
                this._source.readStop();
        };

        // When the source ends, push the EOF-signaling `null` chunk
        this._source.onend = () => {
            this.push(null);
        };
    }
    // _read will be called when the stream wants to pull more data in
    // the advisory size argument is ignored in this case.
    _read(size) {
        this._source.readStart();
    }
}

module.exports = AudioStream;