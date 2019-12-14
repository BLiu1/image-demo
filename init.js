// all project-related image manipulation and display functions
let Project = {};

// takes an Image object and returns an ImageData array
Project.getImage = function (img) {
    let c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;

    let ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return ctx.getImageData(0, 0, img.width, img.height);
};

// prints ImageData (idata) to a canvas (outputCanvas)
Project.printCanvas = function (outputCanvas, idata) {
    outputCanvas.width = idata.width;
    outputCanvas.height = idata.height;

    let ctx = outputCanvas.getContext('2d');
    // if canvas is resized from CSS, resize image
    ctx.putImageData(idata, 0, 0, 0, 0, outputCanvas.clientWidth, outputCanvas.clientHeight);
};

// takes an Image object, filters it with the selected filter
// and optional arguments (otherArgs) and outputs it to a canvas
Project.filterImage = function (outputCanvas, filter, image, otherArgs) {
    let args = [this.getImage(image), otherArgs];
    return this.printCanvas(outputCanvas, filter.apply(null, args));
};

// applies a filter (with otherArgs) on an existing canvas 
Project.redrawCanvas = function (canvas, filter, otherArgs) {
    let ctx = canvas.getContext('2d');
    let args = [ctx.getImageData(0, 0, canvas.width, canvas.height), otherArgs];
    return this.printCanvas(canvas, filter.apply(null, args));
};

// convolves an ImageData pixels array with a square 1D kernel (weights)
Project.convolve = function (pixels, weights) {
    let side = Math.round(Math.sqrt(weights.length)),
        halfSide = Math.floor(side / 2),
        src = pixels.data,
        canvasWidth = pixels.width,
        canvasHeight = pixels.height,
        temporaryCanvas = document.createElement('canvas'),
        temporaryCtx = temporaryCanvas.getContext('2d'),
        outputData = temporaryCtx.createImageData(canvasWidth, canvasHeight);

    // for every image pixel
    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
            let dstOff = (y * canvasWidth + x) * 4,
                sumReds = 0,
                sumGreens = 0,
                sumBlues = 0;

            // for every kernel position
            for (let kernelY = 0; kernelY < side; kernelY++) {
                for (let kernelX = 0; kernelX < side; kernelX++) {
                    let currentKernelY = y + kernelY - halfSide,
                        currentKernelX = x + kernelX - halfSide;

                    if (currentKernelY >= 0 &&
                        currentKernelY < canvasHeight &&
                        currentKernelX >= 0 &&
                        currentKernelX < canvasWidth) {

                        let offset = (currentKernelY * canvasWidth + currentKernelX) * 4,
                            weight = weights[kernelY * side + kernelX];

                        sumReds += src[offset] * weight;
                        sumGreens += src[offset + 1] * weight;
                        sumBlues += src[offset + 2] * weight;
                    }
                }
            }

            outputData.data[dstOff] = sumReds;
            outputData.data[dstOff + 1] = sumGreens;
            outputData.data[dstOff + 2] = sumBlues;
            outputData.data[dstOff + 3] = 255; // alpha channel
        }
    }
    return outputData;
};

// applies threshold filter
// threshold parameter is threshold value
Project.threshold = function (pixels, threshold) {
    threshold = threshold || 128; // default to 128

    for (let i = 0; i < pixels.data.length; i += 4) {
        let r = pixels.data[i],
            g = pixels.data[i + 1],
            b = pixels.data[i + 2];

        // grayscale conversion
        // let value = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // set red, green, and blue channels to all or none depending on threshold
        // pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = (value > threshold) ? 255 : 0;
        pixels.data[i] = (r > threshold) ? 255 : 0;
        pixels.data[i + 1] = (g > threshold) ? 255 : 0;
        pixels.data[i + 2] = (b > threshold) ? 255 : 0;
    }

    return pixels;
};

// applies saturation filter
// pixels is an ImageData object; level is amount of saturation (1 is unchanged)
Project.saturation = function (pixels, level) {
    level = (typeof level === 'number') ? level : 2;
    let RW = 0.3086,
        RG = 0.6084,
        RB = 0.0820,
        RW0 = (1 - level) * RW + level,
        RW1 = (1 - level) * RW,
        RW2 = (1 - level) * RW,
        RG0 = (1 - level) * RG,
        RG1 = (1 - level) * RG + level,
        RG2 = (1 - level) * RG,
        RB0 = (1 - level) * RB,
        RB1 = (1 - level) * RB,
        RB2 = (1 - level) * RB + level;

    for (let i = 0; i < pixels.data.length; i += 4) {
        let r = pixels.data[i],
            g = pixels.data[i + 1],
            b = pixels.data[i + 2];
        pixels.data[i] = RW0 * r + RG0 * g + RB0 * b
        pixels.data[i + 1] = RW1 * r + RG1 * g + RB1 * b
        pixels.data[i + 2] = RW2 * r + RG2 * g + RB2 * b;
    }

    return pixels;
};

// performs simple lowpass filter
// pixels is an ImageData object; size is length of side of square kernel
Project.lowpass = function (pixels, size) {
    size = size || 5;
    let kernel = [],
        total = size * size,
        value = 1.0 / total;

    for (let i = 0; i < total; i++) {
        kernel[i] = value;
    }

    return Project.convolve(pixels, kernel);
};