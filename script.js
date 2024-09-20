let video = document.getElementById('video');
let result = document.getElementById('result');
let model;
let lastPrediction = null;

// Diccionario de traducción de clases de objetos
const translation = {
    'person': 'persona',
    'bicycle': 'bicicleta',
    'car': 'coche',
    'motorcycle': 'moto',
    'airplane': 'avión',
    'bus': 'autobús',
    'train': 'tren',
    'truck': 'camión',
    'boat': 'barco',
    'bird': 'pájaro',
    'dog': 'perro',
    'cat': 'gato',
    'chair': 'silla',
    // Agrega más traducciones según sea necesario...
};

// Cargar el modelo COCO-SSD
async function loadModel() {
    result.innerText = 'Cargando modelo...';
    model = await cocoSsd.load();
    result.innerText = 'Modelo cargado.';
    startDetection();
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const predictions = await model.detect(canvas);

        if (predictions.length > 0) {
            lastPrediction = predictions[0].class; // Guardar la predicción para el audio
            const translatedPredictions = predictions.map(p => {
                const classInSpanish = translation[p.class] || p.class;
                return `${classInSpanish}: ${Math.round(p.score * 100)}%`;
            });
            result.innerHTML = translatedPredictions.join('<br>');
        } else {
            lastPrediction = null;
            result.innerText = 'No se detectaron objetos';
        }

        requestAnimationFrame(detectFrame);
    };

    detectFrame();
}

// Función para decir el objeto detectado en voz alta
function speakPrediction() {
    if (lastPrediction) {
        const predictionInSpanish = translation[lastPrediction] || lastPrediction;
        const speech = new SpeechSynthesisUtterance(`Veo un ${predictionInSpanish}`);
        speech.lang = 'es-ES';
        speech.rate = 0.9; // Ajusta la velocidad de la voz
        window.speechSynthesis.speak(speech);
    } else {
        const speech = new SpeechSynthesisUtterance('No se ha detectado ningún objeto');
        speech.lang = 'es-ES';
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
    }
}

// Iniciar el proceso al cargar la página
window.onload = async () => {
    await enableCamera();
    await loadModel();
};

document.getElementById('speak-button').addEventListener('click', speakPrediction);