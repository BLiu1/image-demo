let imageLoader = document.getElementById("file-input");
let originalImage = document.getElementById("original-image");
let filteredImageCanvas = document.getElementById("filtered-image");
let filterChanger = document.getElementById("filter-changer");
let parameterSlider = document.getElementById("slider");

let imageUploaded = false;

let scaleSlider = function () {
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
            let i = Math.floor(value / 32.0),
                choices = [1, 3, 5, 9, 17, 33, 65, 129];
            result = choices[i];
            break;
        default:
            result = value;
            break;
    }

    return result;
}

// Draws the filtered image to the result canvas
let drawFilteredImage = function (e) {
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
let loadImage = function (e) {
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