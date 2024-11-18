# Using a Pretrained Model from Teachable Machine in JavaScript

To use a pretrained model that you created with Teachable Machine in JavaScript, follow these steps to load and use it in your web application using TensorFlow.js.

## 1. Export the Model from Teachable Machine

After training your model in Teachable Machine, export it for use in a web application:

1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/).
2. Create or open your project.
3. Once your model is trained, click on the **"Export"** button.
4. Select **"TensorFlow.js"** as the export option.
5. Download the model files (usually a `model.json` file and a set of weight files).

## 2. Host the Model

You need to upload the model files (the `model.json` and weight files) to a server or use a hosting service. You can upload them to your own server or use platforms like GitHub, Google Cloud Storage, or any static file hosting service.

## 3. Set Up TensorFlow.js in Your Project

You need to include TensorFlow.js in your project. If you're using a browser, you can either add TensorFlow.js via a CDN or install it via npm.

- **CDN Method** (for browser):
  Add this `<script>` tag in your HTML file:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>


## 4. Load the Model in JavaScript
Once the model is hosted and TensorFlow.js is added to your project, you can load the model and make predictions using the following code:


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teachable Machine Model</title>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
</head>
<body>
  <h1>Use Teachable Machine Model</h1>
  <img id="image" src="path-to-your-image.jpg" width="224" height="224" />
  <script>
    async function runModel() {
      // Load the model from the URL where it's hosted
      const model = await tf.loadGraphModel('https://your-hosted-model-url/model.json');

      // Grab the image element
      const image = document.getElementById('image');

      // Preprocess the image to match the input format the model expects
      const imgTensor = tf.browser.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();
      const input = imgTensor.expandDims(0);  // Add batch dimension

      // Run the prediction
      const prediction = await model.predict(input);

      // Log the result
      prediction.array().then(array => {
        console.log('Prediction:', array);
      });
    }

    runModel();
  </script>
</body>
</html>
```


In this example:

* The model is loaded from a URL (replace 'https://your-hosted-model-url/model.json' with the actual location of your model).
* An image is processed, resized, and converted to a tensor before being passed to the model for prediction.


## 5. Make Predictions
Once the model is loaded and an input (like an image) is processed, you can call the predict() function on the model to get predictions.

Depending on the type of model (e.g., image classification, pose estimation), the output will vary. For an image classification model, the output might be a set of probabilities for each class.

### Example Code for Image Classification
Here’s a basic example assuming you have a classification model from Teachable Machine:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teachable Machine Prediction</title>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
</head>
<body>
  <h1>Teachable Machine Image Classifier</h1>
  <input type="file" id="file-input" />
  <img id="image" style="display:none;" />
  <p id="prediction-result"></p>

  <script>
    async function loadModel() {
      // Load the pretrained model from Teachable Machine
      const model = await tf.loadGraphModel('https://your-model-url/model.json');
      console.log('Model loaded successfully!');
      return model;
    }

    async function predictImage(model) {
      const image = document.getElementById('image');
      const tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();
      const input = tensor.expandDims(0);

      // Get the prediction
      const prediction = await model.predict(input);
      const predictionArray = await prediction.array();

      // Show the prediction result
      const result = predictionArray[0];
      document.getElementById('prediction-result').textContent = `Prediction: ${result}`;
    }

    document.getElementById('file-input').addEventListener('change', (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const image = document.getElementById('image');
        image.src = reader.result;
        image.onload = () => {
          loadModel().then(model => {
            predictImage(model);
          });
        };
      };

      reader.readAsDataURL(file);
    });
  </script>
</body>
</html>
```


### Explanation:
**Image Input**: Users can upload an image file via an <input> element.
Prediction: The uploaded image is passed to the model, which makes predictions and displays the result.

## Final Notes:
* **Model Hosting**: You can host the model on your server, or use a cloud hosting service like Google Cloud Storage or GitHub Pages.
* **Image Preprocessing**: The model expects the image to be resized and normalized to a specific shape (e.g., 224x224). Make sure to preprocess your inputs correctly according to the model's requirements.
* **Prediction Output**: Depending on what your model was trained to do (e.g., image classification, pose estimation), the output will vary, so be sure to adjust how you handle the results.
This approach allows you to deploy a model created with Teachable Machine and integrate it into a real-time web application or a simple demo.