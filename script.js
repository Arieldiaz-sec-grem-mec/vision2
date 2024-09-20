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
    'traffic light': 'semáforo',
    'fire hydrant': 'hidrante',
    'stop sign': 'señal de stop',
    'parking meter': 'parquímetro',
    'bench': 'banco',
    'bird': 'pájaro',
    'cat': 'gato',
    'dog': 'perro',
    'horse': 'caballo',
    'sheep': 'oveja',
    'cow': 'vaca',
    'elephant': 'elefante',
    'bear': 'oso',
    'zebra': 'cebra',
    'giraffe': 'jirafa',
    'backpack': 'mochila',
    'umbrella': 'paraguas',
    'handbag': 'bolso',
    'tie': 'corbata',
    'suitcase': 'maleta',
    'frisbee': 'disco volador',
    'skis': 'esquís',
    'snowboard': 'tabla de snowboard',
    'sports ball': 'pelota',
    'kite': 'cometa',
    'baseball bat': 'bate de béisbol',
    'baseball glove': 'guante de béisbol',
    'skateboard': 'monopatín',
    'surfboard': 'tabla de surf',
    'tennis racket': 'raqueta de tenis',
    'bottle': 'botella',
    'wine glass': 'copa de vino',
    'cup': 'taza',
    'fork': 'tenedor',
    'knife': 'cuchillo',
    'spoon': 'cuchara',
    'bowl': 'cuenco',
    'banana': 'plátano',
    'apple': 'manzana',
    'sandwich': 'sándwich',
    'orange': 'naranja',
    'broccoli': 'brócoli',
    'carrot': 'zanahoria',
    'hot dog': 'perrito caliente',
    'pizza': 'pizza',
    'donut': 'donut',
    'cake': 'pastel',
    'chair': 'silla',
    'couch': 'sofá',
    'potted plant': 'planta en maceta',
    'bed': 'cama',
    'dining table': 'mesa de comedor',
    'toilet': 'inodoro',
    'tv': 'televisor',
    'laptop': 'portátil',
    'mouse': 'ratón',
    'remote': 'mando',
    'keyboard': 'teclado',
    'cell phone': 'celular',
    'microwave': 'microondas',
    'oven': 'horno',
    'toaster': 'tostadora',
    'sink': 'fregadero',
    'refrigerator': 'nevera',
    'book': 'libro',
    'clock': 'reloj',
    'vase': 'jarrón',
    'scissors': 'tijeras',
    'teddy bear': 'oso de peluche',
    'hair drier': 'secador de pelo',
    'toothbrush': 'cepillo de dientes'
};

// Cargar el modelo coco-ssd
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
