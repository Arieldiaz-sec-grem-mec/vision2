let video = document.getElementById('video');
let result = document.getElementById('result');
let model;
let lastPrediction = ''; // Almacena la última predicción para el botón de voz

// Cargar el modelo coco-ssd
async function loadModel() {
    result.innerText = 'Cargando modelo...';
    model = await cocoSsd.load();
    result.innerText = 'Modelo cargado.';
    startDetection(); // Comenzar detección en tiempo real
}

// Obtener acceso a la cámara trasera
async function enableCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment' // Cámara trasera
            }
        });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accediendo a la cámara: ", error);
        result.innerText = 'No se pudo acceder a la cámara';
    }
}

// Detección en tiempo real
async function startDetection() {
    if (!model) {
        result.innerText = 'El modelo no está cargado.';
        return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const detectFrame = async () => {
        // Configura el tamaño del canvas basado en el video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Realizar predicción
        const predictions = await model.detect(canvas);

        if (predictions.length > 0) {
            // Toma la primera predicción
            lastPrediction = predictions[0].class;
            result.innerText = `${predictions[0].class}: ${Math.round(predictions[0].score * 100)}%`;
        } else {
            result.innerText = 'No se detectaron objetos';
            lastPrediction = ''; // Limpiar la predicción si no hay nada detectado
        }

        // Continuar detectando
        requestAnimationFrame(detectFrame);
    };

    detectFrame(); // Llamar a la función para comenzar la detección
}

// Función para decir el objeto detectado en voz alta
function speakPrediction() {
    if (lastPrediction) {
        const speech = new SpeechSynthesisUtterance(`Veo un ${lastPrediction}`);
        speech.lang = 'es-ES';
        window.speechSynthesis.speak(speech);
    } else {
        const speech = new SpeechSynthesisUtterance('No se ha detectado ningún objeto');
        speech.lang = 'es-ES';
        window.speechSynthesis.speak(speech);
    }
}

// Iniciar el proceso al cargar la página
window.onload = async () => {
    await enableCamera();
    await loadModel();
};

// Añadir el evento al botón para decir el objeto en voz alta
document.getElementById('speak-button').addEventListener('click', speakPrediction);
