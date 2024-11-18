// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./engagement-model/";

const globals = {
    model: null,
    webcam: null,
    labelContainer: null,
    maxPredictions: null,
    tallies: {},
};

// Load the image model and setup the webcam
async function init() {
    // await loadPretrainedModel();
    await loadModelsFromFileUploader();
    globals.maxPredictions = globals.model.getTotalClasses();

    // Convenience function to setup a webcam
    await setupWebCam();

    // append elements to the DOM
    createLabelElements();
}

async function loadPretrainedModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    globals.model = model = await tmImage.load(modelURL, metadataURL);
    model.getClassLabels().forEach((label) => (globals.tallies[label] = 0));
}

async function setupWebCam() {
    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    globals.webcam = webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);
}

function createLabelElements() {
    document.getElementById("webcam-container").innerHTML = "";
    document
        .getElementById("webcam-container")
        .appendChild(globals.webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < globals.maxPredictions; i++) {
        // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    globals.webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const predictions = await globals.model.predict(webcam.canvas);
    const formattedPredictions = predictions.map((prediction) => {
        return {
            category: prediction.className,
            percentage: (prediction.probability * 100.0).toFixed(0),
        };
    });
    formattedPredictions.forEach((prediction, i) => {
        labelContainer.childNodes[i].innerHTML = `
            ${prediction.category}: ${prediction.percentage}%
        `;
        if (prediction.percentage >= 100.0 / globals.maxPredictions) {
            globals.tallies[prediction.category] += 1;
        }
    });
    console.log(globals.tallies);
    graph(globals.tallies);
    summarize(globals.tallies);
}

function graph(tallies) {
    const graphEl = document.getElementById("graph-container");
    graphEl.innerHTML = "";
    let i = 1;
    for (const key in tallies) {
        const template = `
            <div class="row">
                <span>${key}</span>
                <div class="bar class_${i}" style="width: ${tallies[key]}px"></div>
            <div>
        `;
        graphEl.insertAdjacentHTML("beforeend", template);
        i++;
    }
}

function getMaxCategory(tallies) {
    let maxCategory = null;
    let maxValue = -Infinity;

    for (const [key, value] of Object.entries(tallies)) {
        if (value > maxValue) {
            maxCategory = key;
            maxValue = value;
        }
    }
    return maxCategory;
}

function summarize(tallies) {
    const category = getMaxCategory(tallies);
    const graphEl = document.getElementById("graph-container");
    graphEl.insertAdjacentHTML(
        "beforeend",
        `<h1>The system thinks you are mostly: ${category}</h1>`
    );
}

// Function to read a file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file);
    });
}

// Function to read a file as ArrayBuffer (for binary weight files)
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file); // For binary files
    });
}

async function loadModelsFromFileUploader() {
    const modelFileInput = document.getElementById("model-file");
    const metadataFileInput = document.getElementById("metadata-file");
    const weightsFilesInput = document.getElementById("weights-files");

    if (modelFileInput.files.length > 0 && weightsFilesInput.files.length > 0) {
        const modelFile = modelFileInput.files[0];
        const metadataFile = metadataFileInput.files[0];
        const weightsFiles = Array.from(weightsFilesInput.files); // Get the weight files

        try {
            // Load all files asynchronously with Promise.all
            const [modelJSONContent, metadataJSONContent, ...weightsContent] =
                await Promise.all([
                    readFileAsText(modelFile), // Load model.json as text
                    readFileAsText(metadataFile),
                    ...weightsFiles.map(readFileAsArrayBuffer), // Load all weight files as ArrayBuffer
                ]);

            console.log("Model JSON loaded:", modelJSONContent);
            console.log("Metadata JSON loaded:", metadataJSONContent);
            console.log("Weight files loaded:", weightsContent);

            // Parse the model JSON
            const parsedModelJSON = JSON.parse(modelJSONContent);
            console.log("Parsed Model JSON:", parsedModelJSON);

            const parsedMetadataJSON = JSON.parse(metadataJSONContent);
            console.log("Parsed Metadata JSON:", parsedMetadataJSON);

            // Now load the model using tmImage with the loaded files
            globals.model = await tmImage.loadFromFiles(
                modelFile,
                weightsFiles[0],
                metadataFile
            );

            globals.model
                .getClassLabels()
                .forEach((label) => (globals.tallies[label] = 0));

            console.log("Model loaded successfully!");
        } catch (error) {
            console.error("Failed to load the model:", error);
        }
    } else {
        alert(
            "Please select both the model.json file and the corresponding weight files."
        );
    }
}
