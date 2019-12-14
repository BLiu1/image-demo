const imageLoader = document.getElementById("file-input");
const originalImage = document.getElementById("original-image");
const filteredImageCanvas = document.getElementById("filtered-image");
const filterChanger = document.getElementById("filter-changer");
const parameterSlider = document.getElementById("slider");

let imageUploaded = false;

const scaleSlider = function () {
    let filter = filterChanger.value,
        value = parameterSlider.value,
        result;

    switch (filter) {
        case "threshold":
            result = value;
            break;
        case "saturation":
            result = value / 256.0 * 2;
            break;
        case "lowpass":
            let i = Math.floor(value / 16.0),
                choices = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];
            result = choices[i];
            break;
        default:
            result = value;
            break;
    }

    return result;
}

// Draws the filtered image to the result canvas
const drawFilteredImage = function (e) {
    let filter = filterChanger.value;

    if (imageUploaded) {
        if (filter == "none") {
            Project.printCanvas(filteredImageCanvas, Project.getImage(originalImage));
        } else {
            // Apply filter
            Project.filterImage(filteredImageCanvas, Project[filter], originalImage, scaleSlider());
        }
    }
}

// Handle image upload into img tag
const loadImage = function (e) {
    let reader = new FileReader();

    reader.onload = function (event) {
        originalImage.onload = function () {
            console.log("Image Succesfully Loaded");
            imageUploaded = true;
        };
        originalImage.src = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
    setTimeout(drawFilteredImage, 100);
}

window.onload = function() {
    imageLoader.addEventListener("change", loadImage, false);
    filterChanger.addEventListener("change", drawFilteredImage, false);
    parameterSlider.addEventListener("input", drawFilteredImage, false);
}