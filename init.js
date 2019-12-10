let Project = {};

Project.getImage = function (img) {
    let c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;

    let ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return ctx.getImageData(0, 0, img.width, img.height);
};

Project.printCanvas = function (selector, idata) {
    selector.width = idata.width;
    selector.height = idata.height;

    let ctx = selector.getContext('2d');
    ctx.putImageData(idata, 0, 0);

};

Project.filterImage = function (selector, filter, image, otherArgs) {
    let args = [this.getImage(image), otherArgs];

    return this.printCanvas(selector, filter.apply(null, args));
};

Project.redrawCanvas = function (selector, filter) {
    let ctx = selector.getContext('2d');

    ctx = [ctx.getImageData(0, 0, selector.width, selector.height)];

    return this.printCanvas(selector, filter.apply(null, ctx));
};

Project.convolve = function (pixels, weights) {
    let side = Math.round(Math.sqrt(weights.length)),
        halfSide = Math.floor(side / 2),
        src = pixels.data,
        canvasWidth = pixels.width,
        canvasHeight = pixels.height,
        temporaryCanvas = document.createElement('canvas'),
        temporaryCtx = temporaryCanvas.getContext('2d'),
        outputData = temporaryCtx.createImageData(canvasWidth, canvasHeight);

    for (let y = 0; y < canvasHeight; y++) {

        for (let x = 0; x < canvasWidth; x++) {

            let dstOff = (y * canvasWidth + x) * 4,
                sumReds = 0,
                sumGreens = 0,
                sumBlues = 0;

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
            outputData.data[dstOff + 3] = 255;
        }
    }
    return outputData;
};

Project.threshold = function (pixels, threshold) {
    threshold = threshold || 128; // default to 128

    for (let i = 0; i < pixels.data.length; i += 4) {
        let r = pixels.data[i],
            g = pixels.data[i + 1],
            b = pixels.data[i + 2];

        // grayscale conversion
        let value = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // set red, green, and blue channels to all or none depending on threshold
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = (value > threshold) ? 255 : 0;
    }

    return pixels;
};

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

// size is length of side of square kernel
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